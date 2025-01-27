import products from './products.json'
import fs from 'fs'

export default function handler (req, res) {
  if (req.method === 'POST') {
    try {
      console.log('body is ', req.body)
      const { name, price, image_url, description, filename, hash, currency } = req.body

      console.log("products", products)

      // Create new product ID based on last product ID
      const maxID = products.reduce((max, product) => 
        Math.max(max, product.id), 0
      )
      console.log("maxID", maxID)
      console.log("eval(maxID", eval(maxID))
      products.push({
        id: maxID + 1,
        name,
        price,
        image_url,
        description,
        filename,
        hash,
        currency
      })
      fs.writeFileSync("./pages/api/products.json", JSON.stringify(products, null, 2))
      res.status(200).send({status: "ok"})
    } catch(error) {
        console.error(error)
        res.status(500).json({error: "error adding product"})
        return
    }
  } else {
      res.status(405).send(`Method ${req.method} not allowed`)
  }
}
