public with sharing class CaseChecklistManagement {
    @AuraEnabled
    public static Map<String,List<Object> > getAllRecordsOfCaseCheckListObject(){
        Map<String, List<Object>> mapName = new Map<String, List<Object>>();
        List<Case_Checklist__c> lstOfCaseCheckList = [SELECT Id, Client__r.Name, assiging_to__r.Name, Note__c, Description__c, Priority__c, Status__c, Due_Date__c,Remaining_Days__c FROM Case_Checklist__c];
        mapName.put('Case_Checklist__c',lstOfCaseCheckList);
        List<String> picklistValues = getStausFieldValue('Case_Checklist__c', 'Status__c');
        mapName.put('picklistValues',picklistValues);
        return mapName;
    }
    @AuraEnabled
    public static List<String> getStausFieldValue (String objectName, String fieldName){
        Schema.DescribeFieldResult objFieldDescribe = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap().get(fieldName).getDescribe();
        List<Schema.PicklistEntry> lstPickListValues = objFieldDescribe.getPickListValues();
        List<String> picklistValues = new List<String>();
        for (Schema.PicklistEntry objPickList : lstPickListValues) {
            picklistValues.add(objPickList.getValue());
        }
        return picklistValues;
    }
    @AuraEnabled
    public static void updateCaseChecklist(Case_Checklist__c caseList) {
        UPDATE caseList;
    }
    @AuraEnabled
    public static void insertCaseChecklist(Case_Checklist__c insertCaseList){
        INSERT insertCaseList;
    }
    @AuraEnabled
    public static List<user> getUserDetails(){
        List<user> userDetail = [SELECT Id, name FROM user WHERE isActive = true];
        return userDetail;
    }
    @AuraEnabled
    public static void updateMultipleCaseChecklist(List<Case_Checklist__c> caseList) {
       UPDATE caseList;
    }
}