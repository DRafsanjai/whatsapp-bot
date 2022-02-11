const { create, decryptMedia } = require('@open-wa/wa-automate');

const configObject = {
  sessionId: 'SAD_CLIENT',
  authTimeout: 60,
  autoRefresh: true,
  cacheEnabled: false,
  chromiumArgs: ['--no-sandbox'],
  disableSpins: true,
  headless: true,
  qrRefreshS: 20,
  qrTimeout: 0,
};

const chromeOptions = {
    headless: true,
    defaultViewport: null,
    args: [
        "--incognito",
        "--no-sandbox",
        "--single-process",
        "--no-zygote"
    ],
};
const browser = await puppeteer.launch(chromeOptions);
const page = await browser.newPage();

const startBot = async () => {
  try {
    const Handler = require('./handler');
    const Client = await create(configObject);

    await Client.onStateChanged(async (state) => {
      if (state === 'TIMEOUT' || state === 'CONFLICT' || state === 'UNLAUNCHED') await Client.forceRefocus();
      console.log('State Changed >', state);
    });

    await Client.onMessage((message) => {
      Handler.messageHandler(Client, message);
    });

    await Client.onGlobalParticipantsChanged((event) => {
      Handler.globalParticipantsChanged(Client, event);
    });

    await Client.onAddedToGroup((event) => {
      Handler.addedToGroup(Client, event);
    });

    await Client.onIncomingCall(async (call) => {
      const { peerJid } = call;
      await Client.contactBlock(peerJid);
      await Client.sendText(peerJid, '_⚠️ Bot lagi sibuk, jangan Telpon! DM ke- *@rzkytmgrr* untuk Unblock!_');
    });
  } catch (error) {
    console.log('Error When start bot ' + error);
  }
};

startBot();
