"use strict"

const express = require('express')
const router = express.Router()
const browserslist = require('browserslist')
const caniuse = require('caniuse-db/data.json').agents
const ww = require('caniuse-db/region-usage-json/alt-ww.json')
const af = require('caniuse-db/region-usage-json/alt-af.json')
const an = require('caniuse-db/region-usage-json/alt-an.json')
const as = require('caniuse-db/region-usage-json/alt-as.json')
const eu = require('caniuse-db/region-usage-json/alt-eu.json')
const na = require('caniuse-db/region-usage-json/alt-na.json')
const oc = require('caniuse-db/region-usage-json/alt-oc.json')
const sa = require('caniuse-db/region-usage-json/alt-sa.json')
const GA_ID = process.env.GA_ID
const pkg = require('../package.json')

/* GET home page. */
router.get('/', function(req, res) {
  const usageData = {
    ww, af, an, as, eu, na, oc, sa
  }
  const query = req.query.q || "defaults"
  const region = req.query.r || "ww"

  let bl = null
  try {
    bl = browserslist(query)
  } catch (e) {
    // Error
    return res.render('index', {
      compatible: null,
      query: query,
      GA_ID: GA_ID,
      description: "A page to display compatible browsers from a browserslist string.",
      error: e
    })
  }

  const compatible = {}

  if (bl) {
    bl.map((b) => {
      b = b.split(" ")
      const db = caniuse[b[0]]

      if(!compatible[db.type]) {
        compatible[db.type] = []
      }
      
      const usagedb = usageData[region].data[b[0]]
      const version = usagedb.hasOwnProperty(b[1]) ? b[1] : ''
      const coverage = version ? usagedb[b[1]]: usagedb[0]

      compatible[db.type].push({
        "version": version,
        "id": b[0],
        "name": db.browser,
        "coverage": coverage,
        "logo": "/images/" + b[0] + ".png"
      })
    })
  }

  res.render('index', {
    compatible: compatible,
    query: query,
    region: region,
    GA_ID: GA_ID,
    blversion: pkg.dependencies["browserslist"],
    coverage: browserslist.coverage(bl),
    description: "A page to display compatible browsers from a browserslist string."
  })
})

module.exports = router
