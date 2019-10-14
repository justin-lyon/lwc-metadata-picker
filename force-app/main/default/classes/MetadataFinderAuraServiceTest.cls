@isTest
private class MetadataFinderAuraServiceTest {
	static TestMethod void getPicklistValues_givenObjectAndField_shouldGetOptions() {
		String objectName = 'Account';
		String fieldName = 'Type';

		Test.startTest();

			List<MetadataFinderAuraService.Option> options = MetadataFinderAuraService.getPicklistValues(objectName, fieldName);

		Test.stopTest();

		System.assert(!options.isEmpty());
	}
}
