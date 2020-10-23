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
- When removing currency it will remove from the highest available denomination first.
- When adding currency it will simply add it without implicit conversion (by default).
- Won't allow removing more currency than is available in total.
## Compatibility
Currently supports any dnd5e character sheet that doesn't change the name of currency input fields.
## Changelog
### 0.9.9
- Added an option to ignore electrum when converting.
### 0.9.8
- Lazy Money now uses the currency conversion rates from `CONFIG.DND5E.currencyConversion`.
### 0.9.7
- Added an option to automatically convert when adding currency.
- Added a brief red flash to indicate if there isn't enough currency to remove.