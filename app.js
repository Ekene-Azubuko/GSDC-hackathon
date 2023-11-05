const express = require('express');
const bodyParser = require('body-parser');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const app = express();

// Middleware to parse JSON data
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.set('view engine', 'ejs');

var bin 
let generateLabels = [];

  // Logic to categorize labels into waste types
  function categorizeWaste(labels) {
    const compostKeywords = ['fruit', 'vegetable', 'organic'];
    const recycleKeywords = ['plastic', 'metal', 'glass'];
    const landfillKeywords = ['paper', 'cloth', 'wood'];
  
    const compostMatches = labels.filter(label => compostKeywords.some(keyword => label.toLowerCase().includes(keyword)));
    const recycleMatches = labels.filter(label => recycleKeywords.some(keyword => label.toLowerCase().includes(keyword)));
    const landfillMatches = labels.filter(label => landfillKeywords.some(keyword => label.toLowerCase().includes(keyword)));
  
    // Determine the most relevant waste category based on label matches
    if (compostMatches.length > recycleMatches.length && compostMatches.length > landfillMatches.length) {
        return 'Compost';
    } else if (recycleMatches.length > compostMatches.length && recycleMatches.length > landfillMatches.length) {
        return 'Recycle';
    } else {
        return 'Landfill';
    }
  }
  

app.get("/", (req, res) => {
    res.render("home");
});
app.post("/process-images", (req, res) => {
    generateLabels = [];
    const imageData = req.body.imageData;

    async function labelDetection() {
        try {
            // Creates a client
            const client = new ImageAnnotatorClient();

            // Convert imageData to Buffer if it's base64 encoded
            const buffer = Buffer.from(imageData, 'base64');

            // Perform label detection on the image
            const [result] = await client.labelDetection(buffer);
            const labels = result.labelAnnotations;

            if (labels && labels.length > 0) {
                console.log('Labels:');
                labels.forEach(label => generateLabels.push(label["description"]));
                for (let i = 0; i < labels.length; i++) {
                  
                  
                }
                res.status(200).json({ labels: labels.map(label => label.description) });
            } else {
                console.log('No labels found.');
                res.status(200).send('No labels found.');
            }
        } catch (err) {
            console.error('Error:', err);
            res.status(500).send('Error occurred while processing the image data.');
        }
    }

    labelDetection();
    // res.redirect("/")
});
app.get("/scan", (req,res)=>{
  res.render("index",{generateLabels:generateLabels,bin:bin})
});
app.get("/generate", (req,res)=>{

  bin=categorizeWaste(generateLabels) 
  console.log(generateLabels);
  res.redirect("/scan")

});
// setup listening port

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, ()=>{
    console.log("server started on port 3000");
});
