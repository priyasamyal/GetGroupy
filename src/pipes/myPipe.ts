import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
name: 'orderBy'      //<-------- lowercase filterCategory we are going to using on html file
})
export class HelloWorld implements PipeTransform {
    constructor(){
        console.log("CONSTRUCTOR CALL")
    }
   
    transform(array, orderBy, asc = true){
        console.log(array,orderBy,asc,array.length)  ;
        console.log(array[0].id,"id")    
          if (!orderBy || orderBy.trim() == ""){
            return array;
          } 
      
          //ascending
          if (asc){
            console.log("asc")
            Array.from(array).sort((item1: any, item2: any) => { 
              console.log(item1,item2,'itme')
              return this.orderByComparator(item1[orderBy], item2[orderBy]);
            });
          }
          else{
            //not asc
            console.log("desc")
            
            return Array.from(array).sort((item1: any, item2: any) => { 
              return this.orderByComparator(item2[orderBy], item1[orderBy]);
            });
          }
      
      }
      
      orderByComparator(a:any, b:any):number{
        console.log(a,b,"param")
      
          if((isNaN(parseFloat(a)) || !isFinite(a)) || (isNaN(parseFloat(b)) || !isFinite(b))){
            console.log("string")
            //Isn't a number so lowercase the string to properly compare
            if(a.toLowerCase() < b.toLowerCase()) return -1;
            if(a.toLowerCase() > b.toLowerCase()) return 1;
          }
          else{
            console.log("num")
            //Parse strings as numbers to compare properly
            if(parseFloat(a) < parseFloat(b)) return -1;
            if(parseFloat(a) > parseFloat(b)) return 1;
           }
      
          return 0; //equal each other
      }
}
