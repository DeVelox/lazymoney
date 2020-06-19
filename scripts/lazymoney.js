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
  })
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

function addMoney(money, delta, denom) {
  money[denom] += delta;
  return money;
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

function updateMoney(money, delta, denom) {
  money[denom] = delta;
  return money;
}

function totalMoney(money) {
  let total = 0;
  for (let key in cpValue) {
    total += money[key] * cpValue[key];
  }
  return total;
}
