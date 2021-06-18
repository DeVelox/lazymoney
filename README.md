# Lazy Money module for Foundry VTT
Easily add or remove currency with automatic conversion and no overdraft.
## Preview
![](https://i.imgur.com/IUml0iX.gif)
## Installation
1. Open Foundry's Setup screen
2. Switch to the "Add-On Modules" tab
3. Click "Install Module"
4. Paste `https://github.com/DeVelox/lazymoney/raw/master/module.json` into the "Manifest URL" field
5. Click "Install"
## Notes
- When removing currency the module will remove it from higher denominations when necessary.
- When adding currency the module will simply add it without implicit conversion (by default).
- The module won't allow removing more currency than is available in total.
## Compatibility
Currently supports any dnd5e character sheet that doesn't change the name of currency input fields.
