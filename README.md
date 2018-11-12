# Asana-counter
Greasemonkey script for Asana to sum up numbers in brackets for selected tasks.

Emulates the behavior of the similar hack that was removed from Asana some time ago:
https://twitter.com/asana/status/453940658915401728?lang=en
https://twitter.com/asana/status/451837803219808256?lang=en

## How to use:
Get Greasemonkey (or Tampermonkey if you use Chrome)  plugin;

Install the script;

Reload the Asana;

You're good to go :).

Examples of expected numbers format in tasks:

- task [42]

- task[3.14]

- [-1] task


**First approach:** Select some tasks. If they have numbers in square brackets in them - the numbers will be summed up and displayed on the right panel.

**Alternative approach:** select the tasks, press "Ctrl+k" - the alert with the sum will be displayed (it also will be printed to console.log).
