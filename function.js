classes = ["Missing Hole", "Mouse Bite", "Open Circuit", "Short Circuit", "SPUR", "Spurious Copper"];
var output;
let model;
let model_loaded = false;
(async () => {
  // document.querySelector("#loading_status").innerHTML = "⏳ Please wait . . . ";
  try {
    model = await tflite.loadTFLiteModel("best_float32.tflite");
    model_loaded = true;
    await clearInterval(run_spinner);
    document.querySelector("#loading_status").innerHTML = "✅ Model is ready";
    document.querySelector("#get_img").disabled = false;
    
  } catch (e)  {
    model_loaded = true;
    clearInterval(run_spinner);
    document.querySelector("#loading_status").innerHTML = "❌ Can't load model";
    console.log("❌ Can't load model");
  }
  

}) ();


async function loading_animation()  {

  let spinner = "⣾⣽⣻⢿⡿⣟⣯⣷";
  for (i = 0; i < spinner.length; i ++)  {
      if (model_loaded) {
        break;
      }
      document.querySelector("#loading_status").innerHTML = "⏳ Please wait " + spinner[i];
      await new Promise(r => setTimeout(r, 150));
 
    
  }
}

var run_spinner = setInterval(loading_animation, 1000);

const getDeviceType = () => {
  const ua = navigator.userAgent;

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    console.log("mobile");
    document.querySelector("#target_img") . width = 150;
    return;
  }
  console.log("desktop");
  document.querySelector("#target_img") . width = 350;
  return;
};


async function set_img() {
  getDeviceType();
  document.querySelector("#predicted_type") . innerHTML = "";
  document.querySelector("html").style.background_image = URL.createObjectURL(document.querySelector("#get_img").files[0]);
  document.querySelector("#target_img").src = URL.createObjectURL(document.querySelector("#get_img").files[0]);
  document.querySelector("button").disabled = false;
  plot_chart([0,0,0,0,0,0]);
}

function predict_shoes() {
  
  img = document.getElementById("target_img");
  tensor = tf.browser.fromPixels(img);
  tensor = tf.image.resizeNearestNeighbor(tensor, [640, 640]);
  tensor = tensor.expandDims(0); 
  tensor = tensor.div(255.0);

  // const input = tf.randomNormal([1, 640, 640, 3]);
  output = model.predict(tensor);
  output = output.arraySync()[0];

  class_id = [];
  boxes = [];
  scores = [];
  output.forEach(data => {
    if (data[4] > .1)   {
        console.log(data[4]);
        scores.push(data[4]);
        boxes.push([data[0], data[1], data[2], data[3]]);
        class_id.push(classes[data[5]]);

    }
   
  });
// console.log(boxes.length);
          drawBoxes(boxes, scores, class_id);
//    console.log(boxes); 
//     return;
}


function drawBoxes(boxes, scores, classes) {
  const img = document.getElementById("target_img");
  const canvas = document.getElementById("overlay");

  
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height); 

  boxes.forEach((box, i) => {
    if (scores[i] > 0.0) { 
    //   const [ymin, xmin, ymax, xmax] = box;
      const [xmax, ymax, xmin, ymin] = box;

      
      const x = xmin * img.width;
      const y = ymin * img.height;
      const w = (xmax - xmin) * img.width;
      const h = (ymax - ymin) * img.height;

      
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

     
      ctx.fillStyle = "red";
      ctx.font = "16px Arial";
      ctx.fillText(
        `${classes ? classes[i] : "obj"} (${(scores[i] * 100).toFixed(1)}%)`,
        x,
        y > 10 ? y - 5 : 10
      );
    }
  });
  if (classes.length == 0)  {
    console.log("No Defects");
  }
}


function plot_chart(scores) {
  document.querySelector("#myChart") . height = 300;
  document.querySelector("#myChart") . width = 300;


const data = {
  labels: classes,
  datasets: [{
    label: 'Confirmation Score',
    data: scores,
 
    backgroundColor: [
      'rgba(255, 99, 132, 0.2)',
      'rgba(255, 159, 64, 0.2)',
      'rgba(255, 205, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(201, 203, 207, 0.2)'
    ],
    borderColor: [
      'rgb(255, 99, 132)',
      'rgb(255, 159, 64)',
      'rgb(255, 205, 86)',
      'rgb(75, 192, 192)',
      'rgb(54, 162, 235)',
      'rgb(153, 102, 255)',
      'rgb(201, 203, 207)'
    ],
    borderWidth: 1
  }]
};

  config = {
  type: 'horizontalBar',
  data: data,
  options: {
    legend:{
    display: false
},
    responsive: true,
  maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
        x: {
            beginAtZero: true
        }
    }
  }
};



  // var yValues = [55, 49, 44, 24, 15];
  new Chart("myChart", config);
}