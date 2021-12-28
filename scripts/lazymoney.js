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

Hooks.once("init", () => {
  game.settings.register("lazymoney", "ignoreElectrum", {
    name: "Ignore electrum",
    hint: "When converting, ignore electrum. This won't affect directly adding or removing it, except in the case when \"Convert when adding money\" is also enabled.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
});

Hooks.once("init", () => {
  game.settings.register("lazymoney", "chatLog", {
    name: "Chat log",
    hint: "Whisper any currency changes to the GM.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
});

const signCase = {
  add: '+',
  subtract: '-',
  equals: '=',
  default: ' '
};

function _onChangeCurrency(ev) {
  const input = ev.target;
  const actor = ev.data.app.actor;
  const sheet = ev.data.app.options;
  const money = ev.data.app.actor.data.data.currency;
  const denom = input.name.split(".")[2];
  const value = input.value;
  let sign = signCase.default;
  Object.values(signCase).forEach(val => {
    if (value.includes(val)) {
      sign = val;
    }
  });
  const splitVal = value.split(sign);
  let delta;
  if (splitVal.length > 1) {
    delta = Number(splitVal[1]);
  }
  else {
    delta = Number(splitVal[0]);
    chatLog(actor, `Replaced ${money[denom]} ${denom} with ${delta} ${denom}.`);
    return;
  }

  let newAmount = {};
  if (!(denom === "ep" && game.settings.get("lazymoney", "ignoreElectrum"))) {
    switch (sign) {
      case signCase.add:
        newAmount = addMoney(money, delta, denom);
        chatLog(actor, `Added ${delta} ${denom}.`);
        break;
      case signCase.subtract:
        newAmount = removeMoney(money, delta, denom);
        chatLog(actor, `Removed ${delta} ${denom}.`);
        if (!newAmount) {
          flash(input);
          newAmount = money;
        }
        break;
      case signCase.equals:
        newAmount = updateMoney(money, delta, denom);
        chatLog(actor, `Replaced ${money[denom]} ${denom} with ${delta} ${denom}.`);
        break;
      default:
        newAmount = updateMoney(money, delta, denom);
        chatLog(actor, `Replaced ${money[denom]} ${denom} with ${delta} ${denom}.`);
        break;
    }
  }
  if (Object.keys(newAmount).length > 0) {
    sheet.submitOnChange = false;
    actor.update({ "data.currency": newAmount }).then(() => {
      input.value = getProperty(actor.data, input.name);
      sheet.submitOnChange = true;
    }).catch(console.log.bind(console));
  }
}

function chatLog(actor, money) {
  if (game.settings.get("lazymoney", "chatLog")) {
    const msgData = { content: money, speaker: ChatMessage.getSpeaker({ actor: actor }), whisper: ChatMessage.getWhisperRecipients("GM") };
    return ChatMessage.create(msgData);
  }
}

function getCpValue() {
  let cpValue = {
    pp: { value: 1000, up: "", down: "gp" },
    gp: { value: 100, up: "pp", down: "ep" },
    ep: { value: 50, up: "gp", down: "sp" },
    sp: { value: 10, up: "ep", down: "cp" },
    cp: { value: 1, up: "sp", down: "" }
  };
  let total = 1;
  if (parseFloat(game.data.system.data.version) >= 1.5) {
    const convert = CONFIG.DND5E.currencies;
    Object.values(convert).reverse().forEach(v => {
      if (v.conversion !== undefined) {
        total *= v.conversion.each;
        cpValue[v.conversion.into].value = total;
      }
    });
  }
  else {
    const convert = CONFIG.DND5E.currencyConversion;
    Object.values(convert).forEach(v => {
      total *= v.each;
      cpValue[v.into].value = total;
    });
  }

  if (game.settings.get("lazymoney", "ignoreElectrum")) {
    cpValue.gp.down = "sp";
    cpValue.sp.up = "gp";
    delete cpValue.ep;
  }
  return cpValue;
}

function getDelta(delta, denom) {
  const cpValue = getCpValue();
  let newDelta = {};
  delta *= cpValue[denom].value;
  for (let key in cpValue) {
    let intDiv = ~~(delta / cpValue[key].value);
    if (intDiv > 0) {
      newDelta[key] = intDiv;
      delta %= cpValue[key].value;
    }
  }
  return newDelta;
}

function scaleDown(oldAmount, denom) {
  const cpValue = getCpValue();
  const up = cpValue[denom].up;
  let newAmount = oldAmount;
  if (newAmount[up] > 0) {
    newAmount[up] -= 1;
    newAmount[denom] += ~~(cpValue[up].value / cpValue[denom].value);
    return newAmount;
  }
  else if (newAmount[up] === 0) {
    newAmount = scaleDown(newAmount, up);
    scaleDown(newAmount, denom);
    return newAmount;
  }
  else {
    return false;
  }
}

function addMoney(oldAmount, delta, denom) {
  const cpValue = getCpValue();
  let newAmount = {};
  if (game.settings.get("lazymoney", "addConvert")) {
    let cpDelta = delta * cpValue[denom].value;
    for (let key in cpValue) {
      newAmount[key] = oldAmount[key] + ~~(cpDelta / cpValue[key].value);
      cpDelta %= cpValue[key].value;
    }
  }
  else {
    newAmount[denom] = oldAmount[denom] + delta;
  }
  return newAmount;
}

function removeMoney(oldAmount, delta, denom) {
  const cpValue = getCpValue();
  let newAmount = oldAmount;
  let newDelta = {};
  let down;
  if (oldAmount[denom] >= delta) {
    newAmount[denom] = oldAmount[denom] - delta;
    return newAmount;
  }
  else {
    newDelta = getDelta(delta, denom);
    delta = delta * cpValue[denom].value;
  }
  if (totalMoney(oldAmount) >= delta) {
    for (let [key, value] of Object.entries(newDelta)) {
      if (newAmount[key] >= value) {
        newAmount[key] -= value;
      }
      else if (scaleDown(newAmount, key)) {
        newAmount[key] -= value;
      }
      else {
        newAmount = oldAmount;
        while (newAmount[key] <= value && totalMoney(newAmount) > 0 && key !== "cp") {
          down = cpValue[key].down;
          value -= newAmount[key];
          newAmount[key] = 0;
          value *= ~~(cpValue[key].value / cpValue[down].value);
          key = down;
        }
        newAmount[key] -= value;
      }
    }
    return newAmount;
  }
  else {
    return false;
  }
}

function updateMoney(oldAmount, delta, denom) {
  let newAmount = {};
  newAmount[denom] = delta;
  return newAmount;
}

function totalMoney(money) {
  const cpValue = getCpValue();
  let total = 0;
  for (let key in cpValue) {
    total += money[key] * cpValue[key].value;
  }
  return total;
}

function flash(input) {
  input.style.backgroundColor = "rgba(255,0,0,0.5)";
  setTimeout(() => {
    input.style.backgroundColor = "";
  }, 150);
}
