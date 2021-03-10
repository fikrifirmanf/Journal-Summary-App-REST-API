const express = require('express')

const app = express()
const cors = require('cors')
const helmet = require('helmet')
const pdf = require('pdf-parse')
const fs = require('fs')
const https = require('https')
const url = require('url')
const {
  getPdf
} = require('./download_pdf')
// const http = require('http')
app.use(cors())
app.use(helmet())

// const myUrl = url.parse('https://journal.uny.ac.id/index.php/jee/article/viewFile/13267/9625')

app.get('/api/resume', (req, res) => {
  const optionsGet = {
    hostname: 'api.getdigest.com',
    port: 443,
    path: '/v3/GetTextFromUrl?url=' + req.query.url + "&_=100",
    method: 'GET',
    // headers: {
    //   'Content-Type': 'application/json',
    // }
  };
  let outputUrl = ""
  const reqsUrl = https.request(optionsGet, async (resp) => {
    resp.setEncoding('utf8')
    // var bodychunks = []
    resp.on("data", function (chunk) {
      // console.log('response '+chunk)
      // res.setHeader('Content-Type', 'application/json')
      // return res.send(chunk)
      outputUrl += chunk
      // console.log(chunk)

    }).on("end", () => {
      let body = JSON.parse(outputUrl)
      console.log(body)

      if (body.Message == 'An error has occurred.') {
        res.status(400).json({
          message: 'URL Salah'
        })
      } else {


        const datapdf = JSON.stringify({
          Source: body,
          parameters: {
            KeywordsQuantity: 0,
            DigestSize: -4500
          }
        })
        const options = {
          hostname: 'api.getdigest.com',
          port: 443,
          path: '/v3/MakeDigest',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
        let output = ""
        const reqs = https.request(options, async (resp) => {
          resp.setEncoding('utf8')
          // var bodychunks = []
          resp.on("data", function (chunk) {
           
            output += chunk
            // console.log(chunk)

          }).on("end", () => {
            let body = JSON.parse(output)
            console.log(body)
            res.send(body)
          })
        })
        //   res.send("hm")
        reqs.on('error', error => {
          console.error(error)
        })

        reqs.write(datapdf)
        reqs.end()

      }
    })
  })
  //   res.send("hm")
  reqsUrl.on('error', error => {
    console.error(error)
  })

  reqsUrl.end()
  console.log("dasd" + outputUrl)

})


app.get('/api/result', (req, res) => {
  // Then you 'get' your image like so:
  getPdf(req.query.url, function (err, dataBuffer) {
    // Handle the error if there was an error getting the image.
    if (err) {
      throw new Error(err);
    }
    return pdf(dataBuffer).then(function (data) {

      res.json({
        data: {
          info: data.info,
          metadata: data.metadata,
          content: data.text
        }
      })

    })

  });
})
app.get('/', (req, res) => {

  res.send('Aku cinta kamu!')
})

app.listen(3000, () => console.log('Running port 3000'))