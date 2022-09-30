import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import axios from 'axios';
import BigNumber from 'bignumber.js';

const WebSocket = require('isomorphic-ws');

require('dotenv').config();

const vestaboard = axios.create({
  baseURL: process.env.VESTABOARD_URL,
  headers: {
    'X-Vestaboard-Api-Key': process.env.VESTABOARD_KEY,
    'X-Vestaboard-Api-Secret': process.env.VESTABOARD_SECRET,
  },
});

const twitter = axios.create({
  baseURL: process.env.TWITTER_URL,
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  },
});

const coinmarketcap = axios.create({
  baseURL: process.env.COINMARKETCAP_URL,
  headers: {
    'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_KEY,
  },
});

const dict = {
  blank: 0,
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9,
  j: 10,
  k: 11,
  l: 12,
  m: 13,
  n: 14,
  o: 15,
  p: 16,
  q: 17,
  r: 18,
  s: 19,
  t: 20,
  u: 21,
  v: 22,
  w: 23,
  x: 24,
  y: 25,
  z: 26,
  '1': 27,
  '2': 28,
  '3': 29,
  '4': 30,
  '5': 31,
  '6': 32,
  '7': 33,
  '8': 34,
  '9': 35,
  '0': 36,
  '!': 37,
  '@': 38,
  '#': 39,
  $: 40,
  '(': 41,
  ')': 42,
  '-': 44,
  '+': 46,
  '&': 47,
  '=': 48,
  ';': 49,
  ':': 50,
  "'": 52,
  '"': 53,
  '%': 54,
  ',': 55,
  '.': 56,
  '/': 59,
  '?': 60,
  '°': 62,
};

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  private characters = [
    [8, 5, 9, 7, 8, 20, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [19, 20, 1, 20, 21, 19, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [20, 23, 9, 20, 20, 5, 18, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 18, 3, 8, 9, 22, 5, 4, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 18, 23, 5, 1, 22, 5, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 9, 20, 3, 15, 9, 14, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  constructor() {
    try {
      const ws = new WebSocket(process.env.NODE_WS);
      let lastStatus = '';

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            event: 'status',
          }),
        );
      };

      ws.onmessage = async (msg) => {
        const status = JSON.parse(msg.data.toString()).map((s) => s.statusCode);

        if (lastStatus !== JSON.stringify(status)) {
          lastStatus = JSON.stringify(status);
          console.log(status);

          this.characters[1].reverse();
          status.reverse();

          for (let s in status) {
            if (status[s] === 'RUNNING') {
              this.characters[1][s] = 66;
            } else if (status[s] === 'STALLING') {
              this.characters[1][s] = 65;
            } else if (status[s] === 'OFFLINE') {
              this.characters[1][s] = 63;
            }
          }

          this.characters[1].reverse();

          if (this.characters[0][21] === 0) {
            await this.handle();
          } else {
            await this.writeToVestaboard();
          }
        }
      };
    } catch (err) {
      console.log(err);
    }
  }

  private async getBlockHeight() {
    let height = '';

    try {
      const { data } = await axios.get(
        `https://rpc.korellia.kyve.network/status`,
      );
      height = `#${data.result.sync_info.latest_block_height}`;
    } catch (err) {
      console.log(err);
      height = 'error';
    }

    this.characters[0].reverse();

    const blockHeight = height.split('').reverse();

    for (let i in blockHeight) {
      this.characters[0][i] = dict[blockHeight[i]];
    }

    this.characters[0].reverse();
  }

  private async getTwitterFollowers() {
    let followers = '';

    try {
      const { data } = await twitter.get(
        `2/users/by/username/KYVENetwork?user.fields=public_metrics`,
      );
      followers = `${data.data.public_metrics.followers_count}`;
    } catch (err) {
      console.log(err);
      followers = 'error';
    }

    this.characters[2].reverse();

    const twitterFollowers = followers.split('').reverse();

    for (let i in twitterFollowers) {
      this.characters[2][i] = dict[twitterFollowers[i]];
    }

    this.characters[2].reverse();
  }

  private async getDataArchived() {
    let archived = '0';

    try {
      const { data } = await axios.get(
        `https://api.korellia.kyve.network/kyve/registry/v1beta1/pools`,
      );

      for (let pool of data.pools) {
        archived = new BigNumber(archived).plus(pool.bytes_archived).toString();
      }

      archived = new BigNumber(archived).dividedBy(10 ** 9).toFixed(2);
      archived += 'gb';
    } catch (err) {
      console.log(err);
      archived = 'error';
    }

    this.characters[3].reverse();

    const dataArchived = archived.split('').reverse();

    for (let i in dataArchived) {
      this.characters[3][i] = dict[dataArchived[i]];
    }

    this.characters[3].reverse();
  }

  private async getPrices() {
    let prices = {
      bitcoin: '',
      arweave: '',
    };

    try {
      const { data } = await coinmarketcap.get(
        `/v2/cryptocurrency/quotes/latest`,
        {
          params: {
            slug: 'bitcoin,arweave',
          },
        },
      );
      prices = {
        bitcoin: `${data.data['1'].quote.USD.price.toFixed(2)}$`,
        arweave: `${data.data['5632'].quote.USD.price.toFixed(2)}$`,
      };
    } catch (err) {
      console.log(err);
      prices = {
        bitcoin: 'error',
        arweave: 'error',
      };
    }

    this.characters[4].reverse();
    this.characters[5].reverse();

    const arweave = prices.arweave.split('').reverse();
    const bitcoin = prices.bitcoin.split('').reverse();

    for (let i in arweave) {
      this.characters[4][i] = dict[arweave[i]];
    }

    for (let i in bitcoin) {
      this.characters[5][i] = dict[bitcoin[i]];
    }

    this.characters[4].reverse();
    this.characters[5].reverse();
  }

  private async writeToVestaboard() {
    this.logger.log('Requesting vestaboard ...');

    const { data } = await vestaboard.post(
      `/subscriptions/${process.env.VESTABOARD_SUBSCRIPTION}/message`,
      {
        characters: this.characters,
      },
    );
    this.logger.log(data.message.id);
  }

  // every hour from 9 to 5 on Monday, Wednesday and Friday
  @Cron('0 7-15 * * 1,3,5')
  async handle() {
    this.logger.log('Getting new status ...');

    await this.getBlockHeight();
    await this.getTwitterFollowers();
    await this.getDataArchived();
    await this.getPrices();

    await this.writeToVestaboard();
  }
}
