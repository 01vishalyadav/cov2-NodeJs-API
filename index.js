const express = require('express');
const mongoose = require('mongoose');
const {spawn} = require('child_process');
const helmet = require('helmet');
const compression = require('compression');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());

// connect to mongoDB
mongoose.connect('mongodb://localhost/covid2')
  .then(()=>console.log('connected to mongodb'))
  .catch((err)=> console.log(`error in connecting to db: ${err}`));

const districtsSchema = new mongoose.Schema({
  name:String,
  active:Number,
  recovered:Number,
  deaths:Number,
  total: Number,
  lastUpdated: {type:Date,default:Date.now()}
});
const District = mongoose.model('District',districtsSchema);

async function createDistrict(name,active,recovered,deaths,total){
  const district = new District({
    name:name,
    active:active,
    recovered:recovered,
    deaths:deaths,
    total:total
  });
  const result = await district.save();
  console.log('createDistrict: creating');
}

async function findDistrict(districtNameToFind){
  const districts = await District
  .find({name:districtNameToFind});
  // console.log(districts);
  return districts;
}

async function findAllDistricts(){
  const districts = await District
  .find();
  return districts;
}

async function updateDistrict(id,active,recovered,deaths,total){
  const result = await District.findByIdAndUpdate(id,{$set:{
    active:active,
    recovered:recovered,
    deaths:deaths,
    total:total,
    lastUpdated:Date.now()
  }});
  console.log('updateDistrict: updating');
}

function executeScript(res,districtName,id,flag){
  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn('python', ['getDistDetails.py',districtName]);
  // collect data from script
  python.stdout.on('data', function (data) {
   console.log('Pipe data from python script ...');
   dataToSend = data.toString();
  });
  // in close event we are sure that stream from child process is closed
  python.on('close', (code) => {
  console.log(`child process close all stdio with code ${code}`);
  //send response to website
  console.log("got data: "+dataToSend);
  if  (dataToSend.search("-1")!=-1)  {
    console.log('Cound not find '+ districtName+" even online!");
    console.log("sending response to website")
    res.status(404).send(districtName+" does not exist");
  }
  else  {
    console.log("sending response to website");
    dataToSend=dataToSend.split(' ');
    let length = dataToSend.length;
    let name = "";
    for(i=0;i<length-4;i++)
    {
      name+=dataToSend[i];
      if(i<length-5 && length-5>0)
      {
        name+=" ";
      }
    }
    res.send({name:name,active:dataToSend[length-4],recovered:dataToSend[length-3],deaths:dataToSend[length-2],total:dataToSend[length-1]});

    //create dist in database
    if  (flag==='c')  {
      console.log('c mode');
      createDistrict(name,dataToSend[length-4],dataToSend[length-3],dataToSend[length-2],dataToSend[length-1])
        .then(res=>console.log('doc created'))
        .catch(err=>console.log('error in creating doc '+err));
    }
    else if(flag==='u')
    {
      console.log('u mode');
      updateDistrict(id,dataToSend[length-4],dataToSend[length-3],dataToSend[lenth-2],dataToSend[lenth-1])
        .then(res=>console.log('doc updated'))
        .catch(err=>console.log('error in updating doc '+err));
    }
  }
  });
}

app.get('/', (req,res)=>{
  console.log("got a connection from: "+req.headers.host);
  // getData();
  res.send('Welcome to Covid2 app!');
  // executeScript(res,'Azamgarh');
});

app.get('/api/districts', (req,res) => {
  console.log("got a connection from: "+req.headers.host);
  findAllDistricts()
    .then(districts=>{
      console.log("sending all data...")
      res.send(districts);
  });
});

app.get('/api/districts/:districtName', (req,res) => {
  console.log("got a connection from: "+req.headers.host);
  let temp=req.params.districtName;
  console.log("search for: ",temp)
  
  temp = temp.toLowerCase();
  let tempArray = temp.split(" ");
  let dntf="";
  for(i=0;i<tempArray.length;i++)
  {
    dntf+=tempArray[i].charAt(0).toUpperCase()+tempArray[i].slice(1);
    if(i<tempArray.length-1 && tempArray.length>1)
    {
      dntf+=" ";
    }
  }
  const districtNameToFind=dntf;
  console.log("dntf:",districtNameToFind);
  // check if this dist exist
  findDistrict(districtNameToFind)
    .then(dist =>{
      if(dist.length>0){
        console.log('Found dist '+districtNameToFind);
        // check if this dist is old
        const lastUpdatedDate=dist[0].lastUpdated;
        const currDate = new Date(Date.now());
        if(lastUpdatedDate.getDate()<currDate.getDate()||
           lastUpdatedDate.getMonth()<currDate.getMonth())
        {
          console.log(districtNameToFind+' is old');
          executeScript(res,dist[0].name,dist[0]._id,'u');
        }
        else  {
          console.log(districtNameToFind+' is updated');
          console.log('sending response');
          res.send(dist[0]);
        }
      }
      else{
        // dist doesn't exist
        console.log("dist "+districtNameToFind+" does not exist in db");
        // execute script(it finds online,returns res
        // and then creates doc in database)
        executeScript(res,districtNameToFind,-1,'c');
        return;
      }
    })
    .catch(err=>{
      console.log("error in finding dist "+err);
    });
});

//PORT env var
const port = (process.env.PORT || 3333);
app.listen(port,()=>console.log('Listening on port '+port));