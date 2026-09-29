import * as Blockly from 'blockly/core';

export const toolbox: Blockly.utils.toolbox.ToolboxInfo = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Logica',
      colour: '#5b80a5',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_boolean' },
      ],
    },
    {
      kind: 'category',
      name: 'Cicli',
      colour: '#5ba55b',
      contents: [
        // Ripetizione numerata: "ripeti N volte"
        {
          kind: 'block',
          type: 'controls_repeat_ext',
          inputs: {
            TIMES: { shadow: { type: 'math_number', fields: { NUM: 10 } } },
          },
        },
        // Ripetizione con condizione booleana: "ripeti mentre / finché"
        { kind: 'block', type: 'controls_whileUntil' },
        // Ciclo con contatore: "conta con i da 1 a 10 di 1"
        {
          kind: 'block',
          type: 'controls_for',
          inputs: {
            FROM: { shadow: { type: 'math_number', fields: { NUM: 1 } } },
            TO: { shadow: { type: 'math_number', fields: { NUM: 10 } } },
            BY: { shadow: { type: 'math_number', fields: { NUM: 1 } } },
          },
        },
        // Interrompi / continua
        { kind: 'block', type: 'controls_flow_statements' },
      ],
    },
    {
      kind: 'category',
      name: 'Matematica',
      colour: '#5b67a5',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
      ],
    },
    {
      kind: 'category',
      name: 'Testo',
      colour: '#5ba58c',
      contents: [
        { kind: 'block', type: 'text' },
        { kind: 'block', type: 'text_print' },
      ],
    },
    { kind: 'category', name: 'Variabili', colour: '330', custom: 'VARIABLE' },
    { kind: 'category', name: 'Funzioni', colour: '290', custom: 'PROCEDURE' },
    {
      kind: 'category',
      name: 'Eventi',
      colour: '45',
      contents: [
        { kind: 'block', type: 'on_start' },
        {
          kind: 'block',
          type: 'on_key',
          inputs: {
            KEY: { shadow: { type: 'kb_key' } },
          },
        },
      ],
    },
    {
      kind: 'category',
      name: 'Tastiera',
      colour: '160',
      contents:[
        { kind: 'block', type: 'press_key' },
        { kind: 'block', type: 'kb_key' }
      ]
    },
  ],
};

export const customBlocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  {
    type: 'on_start',
    message0: "Quando l'app parte %1 %2",
    args0: [
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'DO' },
    ],
    colour: 45,
    tooltip: 'Esegue i blocchi contenuti appena premi RUN',
    helpUrl: '',
  },
  {
    type: 'on_key',
    message0: 'Quando premo il tasto %1 %2 %3',
    args0: [
      { type: 'input_value', name: 'KEY', check: 'KB_KEY' },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'DO' },
    ],
    inputsInline: true,
    colour: 45,
    tooltip: 'Esegue i blocchi contenuti ogni volta che viene premuto il tasto',
    helpUrl: '',
  },
  {
    type: 'press_key',
    message0: 'Pressione tasto %1',
    args0: [
      {
        type: 'input_value',
        name: 'KEY',
        check: 'KB_KEY',
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 160,
    tooltip: '',
    helpUrl: '',
  },
  {
    type: 'kb_key',
    message0: '%1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'VALUE',
        options: [
          ['Invio', 'Enter'],
          ['Spazio', 'Space'],
          ['Esc', 'Escape'],
          ['Tab', 'Tab'],
          ['Backspace', 'Backspace'],
          ['↑', 'ArrowUp'],
          ['↓', 'ArrowDown'],
          ['←', 'ArrowLeft'],
          ['→', 'ArrowRight'],
          ['A', 'a'],
          ['B', 'b'],
          ['C', 'c'],
          ['D', 'd'],
          ['E', 'e'],
          ['F', 'f'],
          ['G', 'g'],
          ['H', 'h'],
          ['I', 'i'],
          ['J', 'j'],
          ['K', 'k'],
          ['L', 'l'],
          ['M', 'm'],
          ['N', 'n'],
          ['O', 'o'],
          ['P', 'p'],
          ['Q', 'q'],
          ['R', 'r'],
          ['S', 's'],
          ['T', 't'],
          ['U', 'u'],
          ['V', 'v'],
          ['W', 'w'],
          ['X', 'x'],
          ['Y', 'y'],
          ['Z', 'z'],
        ],
      },
    ],
    output: 'KB_KEY', // tipo di uscita personalizzato
    colour: 160,
    tooltip: 'Un tasto della tastiera',
    helpUrl: '',
  }
]);
