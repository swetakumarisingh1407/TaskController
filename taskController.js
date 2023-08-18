import { LightningElement,track} from 'lwc';
// Import the Apex methods you're using
import getAllChecklistData from '@salesforce/apex/CaseChecklistManagement.getAllRecordsOfCaseCheckListObject';
import updateCaseChecklist from '@salesforce/apex/CaseChecklistManagement.updateCaseChecklist';
import insertCaseChecklist from '@salesforce/apex/CaseChecklistManagement.insertCaseChecklist';
import getUserDetails from '@salesforce/apex/CaseChecklistManagement.getUserDetails';
import updateMultipleCaseChecklist from '@salesforce/apex/CaseChecklistManagement.updateMultipleCaseChecklist';
export default class TaskController extends LightningElement { 
    ishandleClick = false;
    istogglehandleClick = false;
    IsActive = false;
    searchedRecords = [];
    isEditClick = false;
    searchKeyRecods = false;
    recordId;
    editObject={};
    searchAssignedToKey = '';
    assignedToRecords = [];
    assignedKeyRecods = false;
    usersName = false;
    allActiveUserNames = [];
    records = [];
    initialRecords = [];
    picklistValues ;
    rowIds = [];
    selectedStatus = '';
    selectdays = '';
    searchKey = '';
    searchClientNameKey = '';
    statusPicklistValues ;
    searchKeyClientRecods = false;
    selectAssignedTo = [];
    priorityValues;
    headerName;
    displayRecord={};
    createTask={};
    @track sections = [{Name : "Client Name"},{Name : "Due Date"},{Name : "Status"},{Name : "Priority"},{Name : "Assigned To"},
                    {Name : "Description"},{Name : "Note"},{Name : "Action"}];
    // Define a constant array for the days filter
    get daysValues() {
        return [
            { label: 'All Week', value: 'All Week' },
            { label: 'This Month', value: 'This Month' },
            { label: 'This Week', value: 'This Week' },
            { label: 'Today', value: 'Today' },
            { label: 'Over Due', value: 'Over Due' },
        ];
    }
     // Lifecycle hook to fetch initial data
    connectedCallback(){
        this.fetechAllCheckListData();
        this.fetechUserData();
    }
     // Method to fetch checklist data
    fetechAllCheckListData(event){
        getAllChecklistData().then(result => {
            let listPicklistOption = [];
            let priorityPicklistOption = [];
            this.records = result.Case_Checklist__c;
            this.initialRecords = this.records;
            this.picklistValues = result.picklistValues;
            this.picklistValues.forEach(arraypicklist => {
            listPicklistOption.push( {'label' : arraypicklist, 'value' : arraypicklist});
            });
            this.statusPicklistValues = listPicklistOption;
            this.picklistValues = listPicklistOption;
            this.picklistValues.push({label : 'All', value : 'All'});
            const uniqueValues = new Set();
            const uniqueAssignedToValues = new Set();
            this.initialRecords.forEach(element => {
                if (element.Priority__c) {
                    uniqueValues.add(element.Priority__c);
                }
                if(element.Status__c === 'New'){
                    let obj = new Object();
                    obj.Color = 'background-color:brown;';
                    Object.assign(element,obj);
                }
                if(element.Status__c === 'InProgress'){
                    let obj = new Object();
                    obj.Color = 'background-color:yellow';
                    Object.assign(element,obj);
                }
                if(element.Status__c === 'Completed'){
                    let obj = new Object();
                    obj.Color = 'background-color:green;';
                    Object.assign(element,obj);
                }
            });
            this.priorityValues = Array.from(uniqueValues);
            this.priorityValues.forEach(value => {
            priorityPicklistOption.push({ 'label': value, 'value': value });
            });
            this.priorityValues = priorityPicklistOption;
        }).catch(error => {
            this.error = error;
        });
    }
     // Method to fetch user data
    fetechUserData(event){
        getUserDetails().then(result => {
            this.selectAssignedTo = JSON.parse(JSON.stringify(result));
        }) 
        .catch(error => {
        this.error = error;
        });
    }
      // Method to filter records based on selected options
    updateFILTERecord(event){
        let flag =false;
        if(event.target.label == 'Number of Days to Complete'){
            this.selectdays = event.target.value;
        }
        else if(event.target.dataset.name == 'clientName'){
            this.searchKey = event.target.dataset.value;
            flag=true;  
        }
        else if (event.target.label == 'Filter By Client Name'){
            this.searchKey= event.target.value;
        }
        else if(event.target.label == 'Filter By Status'){
            this.selectedStatus =  event.target.value;
        }
        let filterRecord = this.initialRecords;
        if(this.selectedStatus){
            let statusRecord=[];
            if(this.selectedStatus == 'All'){
            }
            else{
                filterRecord.forEach(element => {
                    if(element.Status__c == this.selectedStatus){
                        statusRecord.push(element);
                    }
                });
                filterRecord = statusRecord;
            }
        }
        if(this.searchKey){
            let searchdata =[];
            let uniqueClientValue = new Set();
            filterRecord.forEach(element => {
            let ele = element.Client__r.Name.toLowerCase();
                if(ele.includes(this.searchKey.toLowerCase())){
                    searchdata.push(element);
                }
            });
            this.searchKeyRecods = true;
            filterRecord = searchdata;
            this.searchedRecords = searchdata;
            if(flag == true ){
                    this.searchKeyRecods = false;
            }
        }
        if(!this.searchKey || this.searchKey==''){
            this.searchKeyRecods = false;
            this.searchedRecords = null;
        }
        if(this.selectdays){
            var datefilter = [];
            if(this.selectdays == 'All Week'){
            }
            else{
                filterRecord.forEach(element => {
                let date = new Date(); 
                if(this.selectdays == 'This Month'){
                    if((date.getMonth()+1) == element.Due_Date__c.slice(5,7)) {
                        datefilter.push(element);
                    }
                }
                else if(this.selectdays == 'This Week'){
                    const currentDate = new Date();
                    const currentDayOfWeek = currentDate.getDay();
                    const startOfWeek = new Date(currentDate);
                    startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);
                    const date =new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate());
                    const st = date.toISOString().split('T')[0];
                    date.setDate(startOfWeek.getDate() +7);
                    const s2 = date.toISOString().split('T')[0];
                    if(element.Due_Date__c >= st && element.Due_Date__c <=s2 ) {
                        datefilter.push(element);
                    }
                }
                else if(this.selectdays == 'Today'){
                    if (element.Due_Date__c == date.toJSON().slice(0, 10)) {
                        datefilter.push(element);
                    
                    }
                }
                else if(this.selectdays == 'Over Due'){
                    if (element.Due_Date__c < date.toJSON().slice(0, 10)) {
                        datefilter.push(element);
                    }
                }
                    
                    });
                filterRecord = datefilter;
            }
        }
        this.records = filterRecord; 
    }
    handleNewCaseChecklist(event){
        if(event.target.label == 'Client')
        {
            this.searchClientNameKey = event.target.value;     
            let selectClientName = [];
            this.initialRecords.forEach(element => {
                var ele = element.Client__r.Name.toLowerCase();
                if(ele.includes(this.searchClientNameKey.toLowerCase())){
                    selectClientName.push(element);
                }
                this.searchKeyClientRecods = true;
                this.searchedRecords = selectClientName;
            });
            if(!this.searchClientNameKey)
            {
                this.searchKeyClientRecods = false;
            }
        }
        else if (event.target.label == 'Assigned To')
        {
            this.searchAssignedToKey = event.target.value;     
            let userName = [];
            this.selectAssignedTo.forEach(element => {
                if(element.Name.includes(this.searchAssignedToKey)){
                    userName.push(element);
                }

            });
            this.assignedKeyRecods = true;
            this.assignedToRecords = userName;
            if(!this.searchAssignedToKey){
                this.assignedKeyRecods = false;
            }
        }
    }
    handleChangeUserName(event){
        if(event.target.label == 'Assigned To'){
            let searchActiveUserNameKey = event.target.value;     
            let selectActiveUserName = [];
            this.selectAssignedTo.forEach(element => {
                if(element.Name.includes(searchActiveUserNameKey)){
                    selectActiveUserName.push(element);
                }
            });
            this.usersName = true;
            this.allActiveUserNames = selectActiveUserName;
            if(!searchActiveUserNameKey){
                this.usersName = false;
            }
        }
    }
    handleSelectAssignedTo(event){
        this.fetechAllCheckListData();
    }
    handleSelection(event){
        this.searchKey = event.target.dataset.value;
        this.searchKeyRecods = false;
        this.updateFILTERecord();
    }
    handleClick(event){
        if(event.target.label == 'Edit'){
            this.headerName = event.target.label+ "Case Checklist";
            this.recordId = event.target.dataset.id;
            this.displayRecord = this.records.find((record) => record.Id == this.recordId);
            this.ishandleClick = true;
        }
        else if(event.target.label == 'Create Task'){
            this.displayRecord = null;
            var Str = event.target.label;
            var newStr = Str.replace('Task','');
            this.headerName = newStr+ "new Case Checklist";
            this.ishandleClick = true;
        }
    }
    hideModalBox() {  
        this.ishandleClick = false;
    }
     // Method to handle saving changes
    handleSave(event){
        if(event.target.dataset.name == 'createAndUpdateSave'){
            if(this.headerName == 'EditCase Checklist'){
                updateCaseChecklist({ caseList: this.displayRecord})
                .then(result => {
                    this.ishandleClick = false;
                    this.connectedCallback();
                })
                .catch(error => {
                    this.error = error;
                });
            }
            else if(this.headerName == 'Create new Case Checklist')
            {
                insertCaseChecklist({ insertCaseList: this.createTask})
                .then(result => {
                    this.ishandleClick = false;
                    this.connectedCallback();
                })
                .catch();
            }
        }
        else if(event.target.dataset.name == 'listSave'){
            let editArray = [];
            for (const [id, values] of Object.entries(this.editObject)) {
                editArray.push({ Id: id, ...values });
            }
            updateMultipleCaseChecklist({ caseList: JSON.stringify(editArray)})
                .then(result => {
                    this.connectedCallback();
                })
                .catch((error) => {
                    this.error = error;
                });
            const rows = this.template.querySelectorAll(`[data-display]`);
            rows.forEach((row) => {
                if (row.hidden) {
                    row.hidden = !row.hidden
                }
            });
            this.template.querySelectorAll(".display").forEach(a => {
                a.setAttribute('hidden', '')
            });
            this.isEditClick = false;
        }
    }
     // Method to handle canceling changes      
    handleCancel(event){
        if(event.target.dataset.name == 'toggleCancel'){
            const rows = this.template.querySelectorAll(`[data-display]`);
            rows.forEach((row) => {
                if (row.hidden) {
                    row.hidden = !row.hidden
                }
            });
            this.template.querySelectorAll(".display").forEach(a => {
                a.setAttribute('hidden', '')
            });
            this.isEditClick = false;
        }
        else if(event.target.dataset.name == 'cancelPopupbutton'){
            this.ishandleClick = false;
        }
    }
    handleEditClick(event){
        this.isEditClick = true;
        var reacordId = event.target.value;
        this.template.querySelectorAll(`[data-display="${reacordId}"]`).forEach(input=>{
            input.setAttribute('hidden','');
        });
        this.template.querySelectorAll(`[data-input="${reacordId}"]`).forEach(input=>{
            input.removeAttribute('hidden');
        });
    }
    // Method to handle toggling the edit mode
    handleToggleClick(event){
        if(event.target.checked){
            this.IsActive = true;
            this.istogglehandleClick = true;
        }
        else{
            this.istogglehandleClick = false;
            this.isEditClick = false;
        }
    }
    handleChange(event){
        if(event.target.label=='Priority'){
            this.displayRecord.Priority__c = event.target.value;
        }
        else if(event.target.label=='Due Date'){
            this.displayRecord.Due_Date__c = event.target.value;
        }
        else if(event.target.label=='Description'){
            this.displayRecord.Description__c = event.target.value;
        }
        else if(event.target.label=='Notes'){
            this.displayRecord.Note__c = event.target.value;
        }
        else if(event.target.label=='Assigned To'){
            this.displayRecord.assiging_to__c = event.target.dataset.id;
            this.displayRecord.assiging_to__r.Name = event.target.dataset.value;
            this.allActiveUserNames = false;
        }
        else if(event.target.label=='Status'){
            this.displayRecord.Status__c = event.target.value;
        }
    }
      // Method to handle creating a new task
    handleCreateTask(event){
        if(event.target.dataset.name == 'clientName'){
            this.createTask['Client__c'] = event.target.dataset.id;
            this.searchClientNameKey = event.target.dataset.value;
            this.searchKeyClientRecods = false;
        }
        if(event.target.label=='Case Name'){
            this.createTask['Name'] = event.target.value;
        }
        if(event.target.label=='Description'){
            this.createTask['Description__c'] = event.target.value;
        }
        if(event.target.label=='Notes'){
            this.createTask['Note__c'] = event.target.value;
        }
        if(event.target.label=='Priority'){
            this.createTask['Priority__c'] = event.target.value;
        }
        if(event.target.label=='Due Date'){
            this.createTask['Due_Date__c'] = event.target.value;
        }
        if(event.target.label=='Status'){
            this.createTask['Status__c'] = event.target.value;
        }
        if(event.target.dataset.name == 'assignedTo'){
            this.createTask['assiging_to__c'] = event.target.dataset.id;
            this.searchAssignedToKey = event.target.dataset.value;
            this.assignedKeyRecods = false;
        }
    }
     // Method to handle toggling field edits in list view
    handleToggleChange(event){
        let fieldName=event.target.name;
        let recId = event.target.dataset.id;
        let value = event.target.value;
        if (!this.rowIds.includes(recId)) {
            this.rowIds.push(recId);
        }
        if (!Object.hasOwn(this.editObject, recId)) {
            this.editObject[recId] = {};
        }
        let temp1 = {};
        temp1[fieldName] = value;
        temp1['Id'] = recId;
        Object.assign(this.editObject[recId], temp1);
    }    
}
