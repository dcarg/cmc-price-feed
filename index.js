const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')

async function getPriceFeed() {
  try {
    const url = 'https://coinmarketcap.com/'

    const { data } = await axios({
      method: "GET",
      url: url,
    })

    const $ = cheerio.load(data)
    const elemSelector = '#__next > div > div.main-content > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div:nth-child(1) > div.h7vnx2-1.bFzXgL > table > tbody > tr'

    const keys = [
      'rank',
      'name',
      'price',
      '24h',
      '7d',
      'marketCap',
      'volume',
      'circulatingSupply'
    ]
    const coinArray = []

    $(elemSelector).each((parentIdx, parentElem) => {
      let keyIndex = 0
      const coinObject = {}

      if (parentIdx <= 9){
        $(parentElem).children().each((childIndex, childElem) => {
          let tdValue = $(childElem).text()

          if (keyIndex === 1 || keyIndex === 6) {
            tdValue = $('p:first-child', $(childElem).html()).text()
          }

          if (tdValue) {
            coinObject[keys[keyIndex]] = tdValue

            keyIndex++
          }
        })

        coinArray.push(coinObject)
      }
    })
    
    return coinArray
  } catch (err) {
    console.error(err);
  }
}

const app = express()

app.get('/api/cmc-price-feed', async (request, result) => {
  try {
    const priceFeed = await getPriceFeed()

    return result.status(200).json({
      result: priceFeed,
    })
  } catch (error) {
    return result.status(500).json({
      error: error.toString(),
    })
  }
})

app.listen(3000, () => {
  console.log('Running on port 3000');
})