require("dotenv").config();
const Sequelize = require("sequelize");
const Telegraf = require("telegraf");
const Extra = require("telegraf/extra");
const Telegram = require("telegraf/telegram");
const Markup = require("telegraf/markup");
const bristol = require("./bristol");
const db = require("./models");
// #region Setup
const bot = new Telegraf(process.env.BOT_TOKEN);
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database/database.sqlite"
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });
// #endregion

bot.on("inline_query", ctx => {
  console.log(ctx);

  const result = bristol.map(e => ({
    type: "article",
    id: e.name,
    title: e.name,
    description: e.description,
    thumb_url: e.image,
    input_message_content: {
      message_text: `I shat a ${e.name} on the Bristol Stool Scale.\nSelect the size of your dump and number of wipes 🧻`
    },
    reply_markup: Markup.inlineKeyboard([
      Markup.callbackButton("Small 🤏", "small"),
      Markup.callbackButton("Normal 🤷", "normal"),
      Markup.callbackButton("Big 😳", "big")
    ])
      .resize()
      .selective()
  }));
  ctx.answerInlineQuery(result);
});

bot.action(["small", "normal", "big"], ctx => {
  // console.log(ctx.callbackQuery.data);
  // console.log(ctx);
  db.stool.findOne({ where: { messageid: ctx.inlineMessageId } }).then(stool => {
    if (stool.get("userid") != ctx.from.id) {
      return;
    }
    stool.update({ size: ctx.callbackQuery.data });
    ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([
        [
          Markup.callbackButton("no wipe✨", "no_wipe"),
          Markup.callbackButton("1️⃣", "wipe_1"),
          Markup.callbackButton("2️⃣", "wipe_2"),
          Markup.callbackButton("3️⃣", "wipe_3")
        ],
        [
          Markup.callbackButton("4️⃣", "wipe_4"),
          Markup.callbackButton("5️⃣", "wipe_5"),
          Markup.callbackButton("6️⃣", "wipe_6"),
          Markup.callbackButton("7️⃣", "wipe_7"),
          Markup.callbackButton("8️⃣", "wipe_8"),
          Markup.callbackButton("9️⃣➕", "wipe_9+")
        ]
      ])
        .resize(true)
        .selective(true)
    );
  });
});

bot.action(["no_wipe", "wipe_1", "wipe_2", "wipe_3", "wipe_4", "wipe_5", "wipe_6", "wipe_7", "wipe_8", "wipe_9+"], ctx => {
  let wipes = 0;
  switch (ctx.callbackQuery.data) {
    case "no_wipe":
      wipes = 0;
      break;
    case "wipe_1":
      wipes = 1;
      break;
    case "wipe_2":
      wipes = 2;
      break;
    case "wipe_3":
      wipes = 3;
      break;
    case "wipe_4":
      wipes = 4;
      break;
    case "wipe_5":
      wipes = 5;
      break;
    case "wipe_6":
      wipes = 6;
      break;
    case "wipe_7":
      wipes = 7;
      break;
    case "wipe_8":
      wipes = 8;
      break;
    case "wipe_9+":
      wipes = 9;
      break;
  }
  db.stool.findOne({ where: { messageid: ctx.inlineMessageId } }).then(stool => {
    if (stool.get("userid") != ctx.from.id) {
      return;
    }

    stool.update({ wipes: wipes });
    ctx.editMessageText(
      `💩 I shat a ${stool.get("size")} sized ${stool.get("type")} on the Bristol Stool Scale.\n${
        wipes === 0 ? "NO WIPE BABY" : `Had to wipe at least ${wipes}x...`
      }`
    );
  });
});

bot.on("chosen_inline_result", ({ chosenInlineResult }) => {
  // console.log("chosen inline result", chosenInlineResult);

  db.stool
    .findOrCreate({
      where: { messageid: chosenInlineResult.inline_message_id },
      defaults: { username: chosenInlineResult.from.username, userid: chosenInlineResult.from.id, type: chosenInlineResult.result_id }
    })
    .then(([stool, created]) => {
      // console.log(stool.get({ plain: true }), created);
    });
});

bot.command("stats", async ctx => {
  let countWipes = await db.stool.sum("wipes", { where: { userid: ctx.from.id } });
  console.log(ctx);

  if (isNaN(countWipes)) {
    ctx.reply("You don't have any data yet.", { reply_to_message_id: ctx.message.message_id });
    return;
  }

  let countNoWipes = await db.stool.count({ where: { wipes: 0, userid: ctx.from.id } });
  let countT1 = await db.stool.count({ where: { type: "Type 1", userid: ctx.from.id } });
  let countT2 = await db.stool.count({ where: { type: "Type 2", userid: ctx.from.id } });
  let countT3 = await db.stool.count({ where: { type: "Type 3", userid: ctx.from.id } });
  let countT4 = await db.stool.count({ where: { type: "Type 4", userid: ctx.from.id } });
  let countT5 = await db.stool.count({ where: { type: "Type 5", userid: ctx.from.id } });
  let countT6 = await db.stool.count({ where: { type: "Type 6", userid: ctx.from.id } });
  let countT7 = await db.stool.count({ where: { type: "Type 7", userid: ctx.from.id } });
  let sum = countT1 + countT2 + countT3 + countT4 + countT5 + countT6 + countT7;

  let countSmall = await db.stool.count({ where: { size: "small", userid: ctx.from.id } });
  let countNormal = await db.stool.count({ where: { size: "normal", userid: ctx.from.id } });
  let countBig = await db.stool.count({ where: { size: "big", userid: ctx.from.id } });
  let sizeSum = countSmall + countNormal + countBig;

  let wipeSats = `🧻 Wipe Stats:
You wiped at least ${countWipes} times.

You had a total of ${countNoWipes} no wipes!`;

  let bristolStats = "";

  if (sum > 0) {
    bristolStats = `

🔬 Bristol Stool Scale Stats:
Type 1: ${countT1}x (${Math.floor((countT1 / sum) * 100)}%)
Type 2: ${countT2}x (${Math.floor((countT2 / sum) * 100)}%)
Type 3: ${countT3}x (${Math.floor((countT3 / sum) * 100)}%)
Type 4: ${countT4}x (${Math.floor((countT4 / sum) * 100)}%)
Type 5: ${countT5}x (${Math.floor((countT5 / sum) * 100)}%)
Type 6: ${countT6}x (${Math.floor((countT6 / sum) * 100)}%)
Type 7: ${countT7}x (${Math.floor((countT7 / sum) * 100)}%)`;
  }

  let sizeStats = "";
  if (sizeSum > 0) {
    sizeStats = `

💩 Dump Size Stats:
Small: ${countSmall}x (${Math.floor((countSmall / sizeSum) * 100)}%)
Normal: ${countNormal}x (${Math.floor((countNormal / sizeSum) * 100)}%)
Big: ${countBig}x (${Math.floor((countNormal / sizeSum) * 100)}%)
    `;
  }

  ctx.reply(wipeSats + bristolStats + sizeStats, { reply_to_message_id: ctx.message.message_id });
});

bot.command("reset", async ctx => {
  await db.stool.destroy({ where: { userid: ctx.from.id } });
  ctx.reply("Deleted all your data.", { reply_to_message_id: ctx.message.message_id });
});

bot.launch();
