

## Contact

<theora.vilderson.contact@gmail.com>

### Features

- **can get info about which blood can donate which type of blood**
- **can get info about the blood can get donated with which type of blood**
- **comparing blood type**


###  Properties can be used :
```JS
  import BloodInfo from "thoera-BloodInfo";
  const bl = new BloodInfo();

  bl.bloodTypes // [+A,-A,...]
  bl.positiveBloodTypes // [+A,+B,...]
  bl.nagtiveBloodTypes // [-A,-B,...]

  // this properties can't be reach In bl.instance(bloodTypeName)

```


###  Methods can be used :
```JS
  import BloodInfo from "thoera-BloodInfo";
  const bl = new BloodInfo();

  // this properties can't be reach In bl.instance(bloodTypeName)
  
  bl.canDonate("-a","+a") // returns {data:true}
  bl.canDonate("-XX","+AA") // returns {Error:"Error"}
  bl.canReceive("+AB","+b") // returns {date:true} on failure {error:"Error"}

  bl.allBloodsTypeCanBeDonate("+A") // returns  {data:[ ["+A","+AB"] ]} on failure {error:"Error"}
  bl.allBloodsTypeCanBeReceive("-A")// returns  {data:[ ["-A","-AB","-o"] ]} on failure {error:"Error"}
  

  bl.bloodTransformationInfo("+B") 
 /* 
  returns 
  {
   data:[{
    bloodType:"+B",
    allBloodsTypeCanBeDonate:["+B","+AB"],
    allBloodsTypeCanBeReceive:["+B","-B","+O","-O"],
   }]
  } 
   
   on failure {error:"Error"} 
  */
 
  bl.isPositiveBlood("+A") // returns {data:true}  on failure {error:"Error"}
  bl.isBloodTypeValid("+Aee") // returns {data:false}  on failure {error:"Error"}

  bl.invertBloodType("+A") // returns {data:"-A"}  on failure {error:"Error"}

  const insBl = bl.instance("-B") // it takes one BloodType And  
  insBl.canDonate("+B") 
  // now doesn't need second parameters because in every fire it uses the first BloodType you have passed i
  // in bl.instance("-B")

  // this methods can take Array is argument or string separated with coma
    bl.canDonate(["-A","+o"],"+A");
    bl.canReceive(["+AB","-b"],["-o","-b"]);

    // you can use signs
    // * => every bloods type
    // *+ => every Positive bloods type
    // *- => every Negative bloods type
    bl.allBloodsTypeCanBeDonate("*+");

    bl.allBloodsTypeCanBeReceive("*-");
    bl.bloodTransformationInfo("-o");


```

