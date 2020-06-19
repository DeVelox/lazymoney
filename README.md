# Lazy Money module for Foundry VTT
Easily add or remove currency with automatic conversion and no overdraft.
## Preview
![](https://i.imgur.com/rQpkArZ.gif)
## Installation
1. Open Foundry's Setup screen
2. Switch to the "Add-On Modules" tab
3. Click "Install Module"
4. Paste `https://github.com/DeVelox/lazymoney/raw/master/module.json` into the "Manifest URL" field
5. Click "Install"
## Notes
- When removing currency it will remove from the highest available denomination first.
- When adding currency it will simply add it without implicit conversion.
- Won't allow removing more currency than is available in total.
## Compatibility
Currently supports any dnd5e character sheet that doesn't change the name of currency input fields.
