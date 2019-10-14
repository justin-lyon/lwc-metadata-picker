public with sharing class MetadataPickerAuraService {

	@AuraEnabled(cacheable=true)
	public static String getFilteredMdt(String filterBy, String filterTest, String metadataName, List<String> mdtFields) {
		List<String> expr = new List<String>();
		expr.add('SELECT ' + String.join(mdtFields, ', '));
		expr.add('FROM ' + metadataName);
		expr.add('WHERE ' + filterBy + ' = \'' + filterTest + '\'' );

		return JSON.serialize(Database.query(String.join(expr, ' ')));
	}

	@AuraEnabled(cacheable=true)
	public static String getMetadata(String searchTerm, String metadataName, List<String> mdtFields) {
		String likeableTerm = '%' + String.escapeSingleQuotes(searchTerm) + '%';
		List<String> expr = new List<String>();
		expr.add('SELECT ' + String.join(mdtFields, ', '));
		expr.add('FROM ' + metadataName);
		expr.add('WHERE MasterLabel LIKE \'' + likeableTerm + '\'');
		expr.add('LIMIT 5');

		return JSON.serialize(Database.query(String.join(expr, ' ')));
	}
}
