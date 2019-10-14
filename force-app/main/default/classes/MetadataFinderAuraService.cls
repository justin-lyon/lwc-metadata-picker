public with sharing class MetadataFinderAuraService {

	@AuraEnabled(cacheable=true)
	public static List<Option> getPicklistValues(String mdtName, String fieldName){
		List<Schema.PicklistEntry> entries = Toolbox.getPicklistEntries(mdtName, fieldName);
		List<Option> options = new List<Option>();
		for (Schema.PicklistEntry ple : entries) {
			Option opt = new Option();
			opt.label = ple.getLabel();
			opt.value = ple.getValue();
			options.add(opt);
		}
		return options;
	}

	public class Option {
		@AuraEnabled
		public String label {get;set;}
		@AuraEnabled
		public String value {get;set;}
	}
}
