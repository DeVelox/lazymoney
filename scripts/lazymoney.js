Hooks.once("ready", () => {
  console.log("lazymoney | Initializing lazymoney");
  Object.keys(CONFIG.Actor.sheetClasses.character).forEach(key => {
    let sheet = key.split(".")[1];
    Hooks.on("render" + sheet, (app, html, data) => {
      html.find("input[name^='data.currency']").off("change");
      html
        .find("input[name^='data.currency']")
        .change({ app: app, data: data }, _onChangeCurrency);
    });
  });
});

Hooks.once("init", () => {
  game.settings.register("lazymoney", "addConvert", {
    name: "Convert when adding money",
    hint: "Automatically convert currency to higher denominations when adding money instead of the default behaviour of preserving the denominations you receive.",
    scope: "client",
    config: true,
    default: false,
    type: Boolean
  });
});

function _onChangeCurrency(ev) {
  const input = ev.target;
  const denom = input.name.split(".")[2];
  const value = input.value;
  const delta = Number(value.slice(1));
  const actor = ev.data.app.actor;
  const sheet = ev.data.app.options;
  const money = ev.data.app.actor.data.data.currency;
  let newAmount = {};
  switch (value[0]) {
    case "+":
      newAmount = addMoney(money, delta, denom);
      break;
    case "-":
      newAmount = removeMoney(money, delta, denom);
      if (newAmount === money) {
        flash(input);
      }
      break;
    case "=":
      newAmount = updateMoney(money, delta, denom);
      break;
  }
  if (!jQuery.isEmptyObject(newAmount)) {
    sheet.submitOnChange = false;
    actor.update({ "data.currency": newAmount }).then(() => {
      input.value = getProperty(actor.data, input.name);
      sheet.submitOnChange = true;
    }).catch(console.log.bind(console));
  }
}

const cpValue = { pp: 1000, gp: 100, ep: 50, sp: 10, cp: 1 };

function addMoney(oldAmount, delta, denom) {
  let newAmount = {};
  if (game.settings.get("lazymoney", "addConvert")) {
    let cpDelta = delta * cpValue[denom];
    for (let key in cpValue) {
      newAmount[key] = oldAmount[key] + ~~(cpDelta / cpValue[key]);
      cpDelta %= cpValue[key];
    }
  } else {
    newAmount[denom] = oldAmount[denom] + delta;
  }
  return newAmount;
}

function removeMoney(oldAmount, delta, denom) {
  delta *= cpValue[denom];
  let newAmount = {};
  let carry = 0;
  if (delta > totalMoney(oldAmount)) {
    return oldAmount;
  }
  for (let key in cpValue) {
    oldAmount[key] *= cpValue[key];
    newAmount[key] = carry + oldAmount[key] - delta;
    if (newAmount[key] < 0) {
      newAmount[key] = 0;
    }
    delta -= carry + oldAmount[key] - newAmount[key];
    carry = newAmount[key] % cpValue[key];
    newAmount[key] = ~~(newAmount[key] / cpValue[key]);
  }
  return newAmount;
}

function updateMoney(oldAmount, delta, denom) {
  let newAmount = {};
  newAmount[denom] = delta;
  return newAmount;
}

function totalMoney(money) {
  let total = 0;
  for (let key in cpValue) {
    total += money[key] * cpValue[key];
  }
  return total;
}

function flash(input) {
  input.style.backgroundColor = "rgba(255,0,0,0.5)";
  setTimeout(() => {
    input.style.backgroundColor = "";
  }, 150);
}