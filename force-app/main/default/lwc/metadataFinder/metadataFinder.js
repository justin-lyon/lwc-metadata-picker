import { LightningElement, api, track } from 'lwc'
import getPicklistValues from '@salesforce/apex/MetadataFinderAuraService.getPicklistValues'

export default class WipContainer extends LightningElement {
  @track mdtId = ''
  @track selectedStatus = ''
  @track filterOptions = []
  @track filterTest = ''

  @api comboLabel = ''
  @api pickerLabel = ''
  @api iconName = 'utility:setup'
  @api placeholder = 'Search...'

  @api mdtName = ''
  @api title = 'MasterLabel'
  @api subtitle = 'Id'
  @api filterBy = 'MasterLabel'

  connectedCallback () {
    this.fetchFilterOptions()
  }

  fetchFilterOptions () {
    getPicklistValues({ mdtName: this.mdtName, fieldName: this.filterBy })
      .then(data => {
        if (data.length === 0) {
          this.filterOptions = [ { label: 'None', value: '' } ]
          return
        }
        this.filterOptions = data
      })
      .catch(error => {
        console.error('error getting ple', error)
      })
  }

  handleFilterSelected (event) {
    this.selectedStatus = event.target.value
    const mdtPicker = this.template.querySelector('c-metadata-picker')
    mdtPicker.clear()
    mdtPicker.getFilterMetadata(this.selectedStatus)
  }

  handleMdtSelected (event) {
    this.mdtId = event.detail ? event.detail.Id : ''
    this.selectedStatus = event.detail && event.detail[this.filterBy] ? event.detail[this.filterBy] : this.selectedStatus

    if (event.detail && event.detail.Id) {
      this.fireSelected()
      const mdtPicker = this.template.querySelector('c-metadata-picker')
      mdtPicker.getFilterMetadata(this.selectedStatus)
    }
  }

  fireSelected () {
    const selected = new CustomEvent('selected', {
      detail: this.mdtId
    })
    this.dispatchEvent(selected)
  }
}
