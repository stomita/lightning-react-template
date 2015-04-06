public with sharing class RecordQueryController {
  @AuraEnabled
  public static List<SObject> queryRecords(String table) {
    String soql = 'SELECT Id, Name FROM ' + table;
    return Database.query(soql);
  }
}
