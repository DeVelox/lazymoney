Hooks.on("renderActorSheet5eCharacter", (app, html, data) => {
  html.find("input[name^='data.currency']").off("change");
  html
    .find("input[name^='data.currency']")
    .change({ app: app, data: data }, _onChangeCurrency);
});

function _onChangeCurrency(ev) {
  const input = ev.target;
  const denom = input.name.split(".")[2];
  const value = input.value;
  const delta = Number(value.slice(1));
  const actor = ev.data.app.actor;
  const sheet = ev.data.app.options;
  switch (value[0]) {
    case "+":
      addMoney(actor, sheet, delta, denom);
      break;
    case "-":
      if (delta * cpValue[denom] <= totalMoney(actor)) {
        removeMoney(actor, sheet, delta, denom);
      } else {
        input.value = getProperty(actor.data, input.name);
      }
      break;
    case "=":
      sheet.submitOnChange = false;
      actor.update({ [`data.currency.${denom}`]: delta }).then(() => {
        sheet.submitOnChange = true;
      });
      break;
  }
}

const cpValue = { pp: 1000, gp: 100, ep: 50, sp: 10, cp: 1 };

function addMoney(actor, sheet, amount, denom) {
  let newAmount = actor.data.data.currency[denom] + Number(amount);
  sheet.submitOnChange = false;
  actor.update({ [`data.currency.${denom}`]: newAmount }).then(() => {
    sheet.submitOnChange = true;
  });
}

function removeMoney(actor, sheet, amount, denom) {
  let cpAmount = amount * cpValue[denom];
  let oldAmount = actor.data.data.currency;
  let newAmount = {};
  for (let key in cpValue) {
    let pay = ~~(cpAmount / cpValue[key]);
    if (pay > oldAmount[key]) {
      newAmount[key] = 0;
      cpAmount -= (pay - oldAmount[key]) * cpValue[key];
    } else {
      newAmount[key] = oldAmount[key] - pay;
      cpAmount -= pay * cpValue[key];
    }
  }
  sheet.submitOnChange = false;
  actor.update({ "data.currency": newAmount }).then(() => {
    sheet.submitOnChange = true;
  });
}

function totalMoney(actor) {
  let money = actor.data.data.currency;
  let total = 0;
  for (let key in cpValue) {
    total += money[key] * cpValue[key];
  }
  return total;
}
