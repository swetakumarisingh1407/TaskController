@isTest
public class TestClassCaseChecklistManagement {
    @testSetup static void setupTestData() {
        Task_Manager__c taskManager = new Task_Manager__c(Name = 'Task 1');
        INSERT taskManager;
        Case_Checklist__c checklist = new Case_Checklist__c(Name = 'Checklist', Client__c = taskManager.Id);
        INSERT checklist;
    }
    @isTest static void testGetAllRecordsOfCaseCheckListObject() {
        Map<String, List<Object>> result = CaseChecklistManagement.getAllRecordsOfCaseCheckListObject();
        List<Case_Checklist__c> resultList = (List<Case_Checklist__c>) result.get('Case_Checklist__c');
        System.assertNotEquals(0, resultList.size());
        List<String> picklistValues = (List<String>) result.get('picklistValues');
        System.assertNotEquals(0, picklistValues.size());
        Test.startTest();
        CaseChecklistManagement.getAllRecordsOfCaseCheckListObject();
        Test.stopTest();
    }
    @isTest static void testGetUserDetails() {
        Test.startTest();
        List<User> userDetails = CaseChecklistManagement.getUserDetails();
        Test.stopTest();
        System.assertNotEquals(0, userDetails.size());
    }
    @isTest static void testInsertCaseChecklist() {
        Case_Checklist__c newChecklist = new Case_Checklist__c(Name = 'New Test Checklist');
        Test.startTest();
        CaseChecklistManagement.insertCaseChecklist(newChecklist);
        Test.stopTest();
        Case_Checklist__c insertedChecklist = [SELECT Id, Name FROM Case_Checklist__c WHERE Id = :newChecklist.Id];
        System.assertNotEquals(null, insertedChecklist);
        System.assertEquals(newChecklist.Name, insertedChecklist.Name);
    }
    @isTest static void testUpdateCaseChecklist() {
        Case_Checklist__c checklist = [SELECT Id, Name, Status__c FROM Case_Checklist__c LIMIT 1];
        checklist.Status__c = 'InProgress';
        Test.startTest();
        CaseChecklistManagement.updateCaseChecklist(checklist);
        Test.stopTest();
        Case_Checklist__c updatedChecklist = [SELECT Id, Name FROM Case_Checklist__c WHERE Id = :checklist.Id];
        System.assertNotEquals(null, updatedChecklist);
    }
    @isTest static void testUpdateMultipleCaseChecklist(){
        List<Case_Checklist__c> caseChecklist = [SELECT Id, Name, Status__c FROM Case_Checklist__c LIMIT 1];
        caseChecklist[0].Status__c = 'InProgress';
        Test.startTest();
        CaseChecklistManagement.updateMultipleCaseChecklist(caseChecklist);
        Test.stopTest();
        List<Case_Checklist__c> updateChecklist = [SELECT Id, Name FROM Case_Checklist__c];
        System.assertNotEquals(null, updateChecklist);
    }
}