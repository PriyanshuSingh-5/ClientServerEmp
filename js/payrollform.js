
let isUpdate=false; //defining global variables in order to update the details

let employeePayrollObj={}; //creating employeepayrollobj update the employee details in local storage


window.addEventListener('DOMContentLoaded',(event)=>{ // checking for update as soon as the content page of html gets loaded, if check for update is passed
    
    
    checkForUpdate();


    const name= document.querySelector('#name');     //getting the name and text error and trying to print error message if regex condition is not satisfied
    const textError= document.querySelector('.name-error');
    
    name.addEventListener('input',function(){ //adding event listener for name input and defining function for the same
      
        if(name.value.length==0)   //if name length is 0, then no error message is printed
        {
            textError.textContent="";
            return;
        }
        try{
            checkName(name.value);
            textError.textContent="";
        }
        catch(e)
        {
           
            textError.textContent=e;  //passing exception message to texterror const.
        }
        
    });
   

    
    const salary= document.querySelector('#salary'); //adding event listener for salary and changing salary output for every salary input made through scrolling
    const output= document.querySelector('.salary-output');

    output.textContent=salary.value;     
    
    salary.addEventListener('input',function(){ 
    output.textContent=salary.value;
    });
    
    dateError= document.querySelector(".date-error"); 
    var year= document.querySelector('#year');
    var month= document.querySelector('#month');
    var day=document.querySelector('#day');
 
    year.addEventListener('input',checkDate);
    month.addEventListener('input',checkDate);
    day.addEventListener('input',checkDate)
    
    function checkDate(){  
    try
    {   
     

        let dates= getInputValueById("#day")+" "+getInputValueById("#month")+" "+getInputValueById("#year");    
        
        dates=new Date(Date.parse(dates)); 
        checkStartDate(dates);
     
        dateError.textContent="";
    }
    catch(e)
    {
        dateError.textContent=e;
    }
    document.querySelector('#cancelButton').href= site_properties.home_page;
}

});

const save=(event)=>{ 
    event.preventDefault();
  
    event.stopPropagation();
    try
    {
    
   
        setEmployeePayrollObject();  
        if(site_properties.use_local_storage.match("true"))
        {
           
            createAndUpdateStorage();  
            resetForm();
          
            window.location.replace(site_properties.home_page);   
        }
        else createOrUpdateEmployeePayroll();
    }
    catch(e)
    {
        return;
    }  
}

const createOrUpdateEmployeePayroll=()=>
{
    let postURL= site_properties.server_url;
    let methodCall="POST";
    if(isUpdate)
    {
        methodCall="PUT";
        postURL=postURL+employeePayrollObj.id.toString();
    }
    makeServiceCall(methodCall,postURL,true,employeePayrollObj)
        .then(responseText=>
            {
                resetForm();
                window.location.replace(site_properties.home_page);                
            })
        .catch(error=>
            {
                throw error;
            })
}


const setEmployeePayrollObject = () => {
    if(!isUpdate && site_properties.use_local_storage.match("true")){
        employeePayrollObj.id= createNewEmployeeId();
    }
    try{
    employeePayrollObj._name = getInputValueById('#name');
    checkName(employeePayrollObj._name);
    setTextValue(".name-error","");
    }
    catch(e){
        setTextValue(".name-error",e)
        throw(e);
    }
    employeePayrollObj._profilePic = getSelectedValues('[name=profile]').pop();
    employeePayrollObj._gender = getSelectedValues('[name=gender]').pop();
    employeePayrollObj._department = getSelectedValues('[name=department]');
    employeePayrollObj._salary = getInputValueById('#salary');
    employeePayrollObj._note = getInputValueById('#notes');
    let date = getInputValueById('#day')+" "+getInputValueById('#month')+" "+
               getInputValueById('#year') ;
    try{
    checkStartDate(employeePayrollObj.date)
    employeePayrollObj._startDate = date;
    }
    catch(e)
    {
        setTextValue(".date-error",e);
        throw e;
    }
}

function createAndUpdateStorage() 
{    
    let employeePayrollList= JSON.parse(localStorage.getItem("EmployeePayrollList")); 
    if(employeePayrollList)
    {      

        let empPayrollData= employeePayrollList.find(empData=>empData.id==employeePayrollObj.id)  
      
        if(!empPayrollData) 
        {          
            
            employeePayrollList.push(employeePayrollObj);  
        }  
        else       
        {
            
            const index= employeePayrollList.map(empData=>empData.id).indexOf(empPayrollData.id);
            employeePayrollList.splice(index,1,employeePayrollObj);  
    }
}
   
    else
    {
        employeePayrollList=[employeePayrollObj]
    }
  
    localStorage.setItem("EmployeePayrollList",JSON.stringify(employeePayrollList));      
}

const createNewEmployeeId = () => {
    
    let empID = localStorage.getItem("EmployeeID");
    empID = !empID ? 1 : (parseInt(empID)+1).toString();
    localStorage.setItem("EmployeeID",empID);  
    return empID;   
}


const getSelectedValues=(propertyValue)=>{ 
    
    let allItems= document.querySelectorAll(propertyValue);
   
    let selItems=[];  
 
    allItems.forEach(item=>{
        if(item.checked) selItems.push(item.value);
    });
    return selItems;
}

const getInputValueById=(id)=>
{
    let value= document.querySelector(id).value;
    return value;
}

const getInputElementValue=(id)=>{
    let value= document.getElementById(id).value;
    return value;
}

const resetForm=()=>{ 
    
    setValue('#name',''); 

    unsetSelectedValues('[name=profile]');
    unsetSelectedValues('[name=gender]');
    unsetSelectedValues('[name=department]');
    setValue('#salary','');
    setValue('#notes','');
    setValue('#day',1);
    setValue('#month','January');
    setValue('#year','2021');
}

const unsetSelectedValues= (propertyValue)=>{
    let allItems= document.querySelectorAll(propertyValue);
    allItems.forEach(items=>{
        items.checked=false;
    });
}

const setTextValue=(id,value)=>
{
    const element= document.querySelector(id);
    element.textContent=value;
}

const setValue=(id,value)=>
{
    const element= document.querySelector(id);
    element.value=value;
}


const checkForUpdate=()=>{ 
  
    const employeePayrollJson= localStorage.getItem('editEmp');   
   
    isUpdate= employeePayrollJson?true:false;
    if(!isUpdate) return;
    employeePayrollObj= JSON.parse(employeePayrollJson);
    
    setForm();
}

const setForm = () => { 
   
    setValue('#name', employeePayrollObj._name);  
 
    setSelectedValues('[name=profile]', employeePayrollObj._profilePic);
    setSelectedValues('[name=gender]', employeePayrollObj._gender);
    setSelectedValues('[name=department]', employeePayrollObj._department);
    setValue('#salary',employeePayrollObj._salary);
    
    setTextValue('.salary-output', employeePayrollObj._salary);
    setValue('#notes',employeePayrollObj._note);
    let date = stringifyDate(employeePayrollObj._startDate).split(" ");
    setValue('#day', date[0]);
    setValue('#month',date[1]);
    setValue('#year',date[2]);
}

const setSelectedValues = (propertyValue, value) => { 
    let allItems = document.querySelectorAll(propertyValue);
   
    allItems.forEach(item => {
       
        if(Array.isArray(value)) {
            if (value.includes(item.value)) {
                item.checked = true;
            }
        }
         
        else if (item.value === value)
            item.checked = true;
    });    
}