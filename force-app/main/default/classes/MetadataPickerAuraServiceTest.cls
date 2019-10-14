@isTest
private class MetadataPickerAuraServiceTest {
	static TestMethod void getFilteredMdt_givenFilter_shouldGetOneMdtRecord() {
		String filterBy = 'Size__c';
		String filterTest = 'Medium';
		String mdtName = 'Dragon__mdt';
		List<String> fields = new List<String> { 'MasterLabel', 'Size__c' };

		Test.startTest();

			String resJson = MetadataPickerAuraService.getFilteredMdt(filterBy, filterTest, mdtName, fields);

		Test.stopTest();

		List<Dragon__mdt> dragons = (List<Dragon__mdt>)JSON.deserialize(resJson, List<Dragon__mdt>.class);
		System.assert(!dragons.isEmpty());
		System.assertEquals(1, dragons.size());
	}

	static TestMethod void getMetadata_givenSearchTerm_shouldGetOneRecord() {
		String searchTerm = 'Fluffykins';
		String metadataName = 'Dragon__mdt';
		List<String> mdtFields = new List<String> { 'Masterlabel', 'Size__c' };

		Test.startTest();

			String resJson = MetadataPickerAuraService.getMetadata(searchTerm, metadataName, mdtFields);

		Test.stopTest();

		List<Dragon__mdt> dragons = (List<Dragon__mdt>)JSON.deserialize(resJson, List<Dragon__mdt>.class);
		System.assert(!dragons.isEmpty());
		System.assertEquals(1, dragons.size());
	}
}
