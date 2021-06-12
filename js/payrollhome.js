let empPayrollList; 
window.addEventListener('DOMContentLoaded',(event)=>
{
    if(site_properties.use_local_storage.match("true"))
    {
        getEmployeePayrollDataFromStorage();
    }
    else
        getEmployeePayrollDataFromServer();
});

const getEmployeePayrollDataFromStorage= ()=>{
    empPayrollList= localStorage.getItem('EmployeePayrollList')?JSON.parse(localStorage.getItem('EmployeePayrollList')):[];
    processEmployeePayrollDataResponse();
}
const processEmployeePayrollDataResponse=()=>{
    document.querySelector(".emp-count").textContent=empPayrollList.length;
    createInnerHtml();
    localStorage.removeItem('editEmp');
}

const getEmployeePayrollDataFromServer=()=>
{
    makeServiceCall("GET",site_properties.server_url,true)
        .then(responseText=>{
            empPayrollList= JSON.parse(responseText);
            processEmployeePayrollDataResponse();
        })
        .catch(error=>{
            console.log("GET Error Status: "+JSON.stringify(error));
            empPayrollList=[];
            processEmployeePayrollDataResponse();
        })
}


const createInnerHtml=()=> 
{
    
    if(empPayrollList.length==0) return; 
    const headerHtml= "<tr><th></th><th>Name</th><th>Gender</th><th>Department</th><th> Salary</th><th>Start Date</th><th>Actions</th></tr>"
    
    let innerHtml= `${headerHtml}`;
    
    for(const empPayrollData of empPayrollList){ 
        innerHtml= `${innerHtml}
        <tr>
            <td><img class="profile" alt="" src="${empPayrollData._profilePic}"></td>
            <td>${empPayrollData._name}</td>
            <td>${empPayrollData._gender}</td>
            <td>${getDeptHtml(empPayrollData._department)}
            </td>
            <td>&#x20b9 ${empPayrollData._salary}</td>
            <td>${stringifyDate(empPayrollData._startDate)}</td>
            <td><img id="${empPayrollData.id}" onclick= "remove(this)" alt="delete" src="../assets/icons/delete-black-18dp.svg">
            <img id="${empPayrollData.id}" onclick= "update(this)" alt="edit" src="../assets/icons/create-black-18dp.svg"></td>
        </tr>`;
    }  
    
    document.querySelector('#table-display').innerHTML=innerHtml;  
}


const createEmployeePayrollJSON = () => {
    let empPayrollListLocal = [
      {       
        _name: 'Priyanshu',
        _gender: 'female',
        _department: [
            
            'Finance'
        ],
        _salary: '30000',
        _startDate: '11 June 2021',
        _note: 'CSI Engineer',
        id: new Date().getTime(),
        _profilePic: '../assets/profile-images/Ellipse -3.png'
      }
    ];
    return empPayrollListLocal;
  }

  const getDeptHtml= (deptList)=> 
  {
      let deptHtml='';
      for(const dept of deptList)
      {
          deptHtml= `${deptHtml}<div class="dept-label">${dept}</div>`
      }
      return deptHtml;
  }

 
  const remove= (node)=>{  
      let empPayrollData= empPayrollList.find(empData=>empData.id==node.id);  
      if(!empPayrollData) return;     
      
      const index= empPayrollList.map(empData=>empData.id).indexOf(empPayrollData.id);  
      empPayrollList.splice(index,1); 
      if(site_properties.use_local_storage.match("true"))
      {
     
      localStorage.setItem("EmployeePayrollList",JSON.stringify(empPayrollList));  

      document.querySelector(".emp-count").textContent= empPayrollList.length;  
      }       
      else
      {
          const deleteURL= site_properties.server_url+empPayrollData.id.toString();
          makeServiceCall("DELETE",deleteURL,false)
          .then(responseText=>
            {
                document.querySelector(".emp-count").textContent= empPayrollList.length;
                createInnerHtml();
            })
            .catch(error=>{
                console.log("DELETE Error status: "+JSON.stringify(error));
            })
      }     
      createInnerHtml();  
  }

  
  const update= (node)=>{     
      let empPayrollData= empPayrollList.find(empData=>empData.id== node.id); 
      if(!empPayrollData) return; 
      localStorage.setItem('editEmp',JSON.stringify(empPayrollData)); 
      window.location.replace(site_properties.emp_payroll_page); 
  }