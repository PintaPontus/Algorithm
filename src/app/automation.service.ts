import {Injectable} from '@angular/core';
import {TauriInteractionsService} from "./tauri-interactions.service";
import {AutomationItem, AutomationType, MouseButton} from "../interfaces/automation-interfaces";
import {appConfigDir} from "@tauri-apps/api/path";
import {appWindow, LogicalSize} from "@tauri-apps/api/window";
import {confirm} from "@tauri-apps/api/dialog";

@Injectable({
    providedIn: 'root'
})
export class AutomationService {

    private tauriService: TauriInteractionsService;
    public actionsList: AutomationItem[] = [];
    private stopped: boolean = true;
    private executing: boolean = false;
    public cycleActions: boolean = true;
    public actionsDelay: number = 100;
    private readonly SETTINGS_FILE_NAME: string = ".algorithm-actions.json";
    private readonly WAITING_STEP: number = 50;
    public CURRENT_DIR: string = "";
    private startTimeout: number | undefined;
    private stopTimeout: number | undefined;

    constructor(tauriService: TauriInteractionsService) {
        this.tauriService = tauriService;

        this.initWindow();
        this.initSettings();
    }

    private initWindow() {
        Promise.allSettled([
            appWindow.setMinSize(new LogicalSize(1200, 600)),
            appWindow.listen("algo://play-request", async () => this.play()),
            appWindow.listen("algo://pause-request", async () => this.pause()),
            appWindow.listen("algo://stop-request", async () => this.stop()),
            appWindow.listen("tauri://close-requested", async () => {
                if (!await appWindow.isVisible()) {
                    await this.saveAndClose();
                } else if (
                    await confirm("Are you sure you want to close the app?",
                        {okLabel: "Minimize", cancelLabel: "Close"})
                ) {
                    await appWindow.hide();
                } else {
                    await this.saveAndClose();
                }
            })
        ]).then(r => {
            this.tauriService.log_rust(`Init Window Done: ${JSON.stringify(r)}`);
        });
    }

    private async initSettings() {
        Promise.allSettled([
            this.setPaths(),
            this.openActions(await appConfigDir() + this.SETTINGS_FILE_NAME)
        ]).then(r => {
            this.tauriService.log_rust(`Init Settings Done: ${JSON.stringify(r)}`);
        });
    }

    private async setPaths() {
        this.CURRENT_DIR = await this.tauriService.getCurrentDir();
    }

    async automation_loop() {
        let actualItem: AutomationItem;
        let previousItem: AutomationItem | undefined;

        function deactivatePrevious(previousItem: AutomationItem) {
            previousItem.waited = undefined;
            previousItem.active = false;
        }

        async function waitMs(time: number) {
            await new Promise(f => setTimeout(f, time));
        }

        for (let i = 0; !this.stopped && this.actionsList.length > 0; i = (i + 1) % this.actionsList.length) {
            while (!this.executing && !this.stopped && this.actionsList.length > 0) {
                await waitMs(this.actionsDelay > 100 ? this.actionsDelay : 100);
            }

            if (previousItem) {
                deactivatePrevious(previousItem);
            }

            if (this.actionsList.length === 0) {
                this.stopped = true;
            }

            if (this.stopped) {
                break;
            }

            actualItem = this.actionsList[i];
            actualItem.active = true;

            switch (actualItem.type) {
                case AutomationType.WAIT:

                    if (actualItem.duration <= this.WAITING_STEP) {
                        await waitMs(actualItem.duration);
                    } else {
                        actualItem.waited = 0;
                        while (actualItem.waited < actualItem.duration && this.executing && !this.stopped) {
                            await waitMs(this.WAITING_STEP);
                            actualItem.waited += this.WAITING_STEP;
                        }
                    }
                    break;
                case AutomationType.MOVE_MOUSE:
                    await this.tauriService.moveTo(actualItem.position.x, actualItem.position.y);
                    break;
                case AutomationType.CLICK_MOUSE:
                    await this.tauriService.click(MouseButton.LEFT);
                    break;
                case AutomationType.SCROLL_MOUSE:
                    await this.tauriService.scroll(actualItem.scrollAmount);
                    break;
                case AutomationType.KEYBOARD_TYPE:
                    await this.tauriService.keyboardType(actualItem.keyboardTyping);
                    break;
                case AutomationType.KEYBOARD_SEQUENCE:
                    await this.tauriService.keyboardSequence(actualItem.keyboardTyping);
                    break;
            }
            await waitMs(this.actionsDelay);
            previousItem = actualItem;
            deactivatePrevious(previousItem);
            if (i + 1 === this.actionsList.length && !this.cycleActions) {
                this.stopped = true;
            }
        }

    }

    isWorking() {
        return this.executing && !this.stopped;
    }

    isPaused() {
        return !this.executing && !this.stopped;
    }

    play() {
        this.clearStartTimeout();
        if (this.actionsList.length > 0) {
            this.executing = true;
            if (this.stopped) {
                this.stopped = false;
                this.automation_loop();
            }
        }
    }

    pause() {
        this.executing = false;
    }

    stop() {
        this.clearStopTimeout();
        this.stopped = true;
        this.executing = false;
    }

    add() {
        this.actionsList.push(new AutomationItem())
    }

    import(json: string) {
        this.actionsList = JSON.parse(json);
    }

    export() {
        return JSON.stringify(this.actionsList);
    }

    async saveAndClose() {
        await this.saveActionsToFile(await appConfigDir() + this.SETTINGS_FILE_NAME, true);
        await appWindow.close();
    }

    async saveActions(path: string) {
        await this.saveActionsToFile(path, false);
    }

    private async saveActionsToFile(path: string, hidden: boolean) {
        await this.tauriService.saveFile(path, this.export(), hidden);
    }

    async openActions(path: string) {
        await this.tauriService.openFile(path).then(content => {
            if (content !== "") {
                this.import(content);
            }
        });
    }

    isWaitingStart() {
        return Boolean(this.startTimeout);
    }

    isWaitingStop() {
        return Boolean(this.stopTimeout);
    }

    setStartTimer(date: Date | undefined) {
        this.tauriService.log_rust(`SETTING START TIMER ${date}`);
        this.tauriService.log_rust(`${date ? this.getTiming(date) : "NONE"}`);
        this.clearStartTimeout();

        if (date) {
            let timing = this.getTiming(date);
            if (timing > 0) {
                this.startTimeout = setTimeout(
                    () => this.play(),
                    timing
                );
            } else {
                this.play();
            }
        }
    }

    setStopTimer(date: Date | undefined) {
        this.clearStopTimeout();

        if (date) {
            let timing = this.getTiming(date);
            if (timing > 0) {
                this.stopTimeout = setTimeout(
                    () => this.stop(),
                    timing
                );
            } else {
                this.stop();
            }
        }
    }

    getTiming(date: Date) {
        return (date.getTime()) - (new Date().getTime());
    }

    clearStartTimeout() {
        clearTimeout(this.startTimeout);
        this.startTimeout = undefined;
    }

    clearStopTimeout() {
        clearTimeout(this.stopTimeout);
        this.stopTimeout = undefined;
    }
}
