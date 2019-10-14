/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, api, track } from 'lwc'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import getFilteredMdt from '@salesforce/apex/MetadataPickerAuraService.getFilteredMdt'
import getMetadata from '@salesforce/apex/MetadataPickerAuraService.getMetadata'

const ARROW_UP = 'ArrowUp'
const ARROW_DOWN = 'ArrowDown'
const ENTER = 'Enter'
const ESCAPE = 'Escape'
const ACTIONABLE_KEYS = [ ARROW_UP, ARROW_DOWN, ENTER, ESCAPE ]

export default class Lookup extends LightningElement {
  @track inputValue = ''
  @track records = []
  @track focused = false
  @track selected = ''
  @track record
  @track error
  @track recordIds = []
  @track activeId = ''

  @api iconName = 'utility:setup'
  @api fieldLabel = 'Search'
  @api placeholder = 'Search...'

  @api mdtName
  @api title = 'Name'
  @api subtitle = 'Id'
  @api filterBy = ''
  @api filterTest

  connectedCallback () {
    this.requestFiltered()
  }

  @api
  clear () {
    this.clearSelection()
  }

  @api
  getFilterMetadata (filterTest) {
    this.filterTest = filterTest
    this.requestFiltered()
  }

  get isReadOnly () { return this.record }
  get showListbox () { return this.focused && this.records.length > 0 && !this.record }
  get showClear () { return this.record || (!this.record && this.inputValue.length > 0) }
  get hasError () { return this.error ? this.error.message : '' }
  get mdtFields () { return [ this.title, this.subtitle ] }

  get containerClasses () {
    const classes = [ 'slds-combobox_container' ]

    if (this.record) {
      classes.push('slds-has-selection')
    }

    return classes.join(' ')
  }

  get inputClasses () {
    const classes = [
      'slds-input',
      'slds-combobox__input' ]

    if (this.record) {
      classes.push('slds-combobox__input-value')
    }

    return classes.join(' ')
  }

  get comboboxClasses () {
    const classes = [
      'slds-combobox',
      'slds-dropdown-trigger',
      'slds-dropdown-trigger_click' ]

    if (this.showListbox) {
      classes.push('slds-is-open')
    }
    return classes.join(' ')
  }

  onKeyup (event) {
    this.inputValue = event.target.value
    this.error = null

    const keyAction = {
      ArrowUp: () => { this.cycleActive(false) },
      ArrowDown: () => { this.cycleActive(true) },
      Enter: () => { this.selectItem() },
      Escape: () => { this.clearSelection() }
    }

    if (ACTIONABLE_KEYS.includes(event.code)) {
      keyAction[event.code]()

    } else {
      if (event.target.value.length > 2) {
        this.debounceSearch()
      } else if (event.target.value.length === 0) {
        this.records = []
        this.requestFiltered()
      } else {
        this.error = {
          message: 'Minimum 3 characters'
        }
      }
    }
  }

  handleSelected (event) {
    this.selected = event.detail
    this.record = this.records.find(record => record.Id === this.selected)
    this.inputValue = this.record[this.title]
    this.fireSelected()
  }

  search () {
    this.error = null

    getMetadata({
      searchTerm: this.inputValue,
      metadataName: this.mdtName,
      mdtFields: [ this.title, this.subtitle ] })
      .then(data => {
        const newData = JSON.parse(data)
        this.records = newData.sort((a, b) => this.sortAlpha(a, b))
        this.recordIds = this.getRecordIds()

        if (this.records.length === 0) {
          this.fireToast({
            title: 'Info',
            variant: 'info',
            message: 'No records found, please refine your search.'
          })
        }
      })
      .catch(error => {
        console.error('Error searching records: ', error)
        this.error = error
      })
  }

  debounceSearch () {
    window.clearTimeout(this.delaySearch)
    this.delaySearch = setTimeout(() => {
      this.search()
    }, 300)
  }

  requestFiltered () {
    this.error = null

    getFilteredMdt({
      filterBy: this.filterBy,
      filterTest: this.filterTest,
      metadataName: this.mdtName,
      mdtFields: [ this.title, this.subtitle ] })
      .then(data => {
        this.records = JSON.parse(data).sort((a, b) => this.sortAlpha(a, b))
        this.recordIds = this.getRecordIds()
      })
      .catch(error => {
        console.error('Error requesting recents', error)
        this.error = error
      })
  }

  clearSelection () {
    this.selected = ''
    this.record = null
    this.recordIds = []
    this.inputValue = ''
    this.error = null
    this.requestFiltered()
    this.fireSelected()
  }

  fireSelected () {
    const selected = new CustomEvent('selected', {
      detail: { ...this.record }
    })
    this.dispatchEvent(selected)
  }

  cycleActive (forwards) {
    const currentIndex = this.recordIds.indexOf(this.activeId)
    if (currentIndex === -1 || currentIndex === this.records.length) {
      this.activeId = this.recordIds[0]
    } else if (!forwards && currentIndex === 0) {
      this.activeId = this.recordIds[this.recordIds.length - 1]
    } else if (forwards) {
      this.activeId = this.recordIds[currentIndex + 1]
    } else {
      this.activeId = this.recordIds[currentIndex - 1]
    }
  }

  selectItem () {
    if (this.activeId === '' || !this.recordIds.includes(this.activeId)) {
      this.activeId = this.records[0].Id
    }

    const listbox = this.template.querySelector('c-listbox')
    listbox.selectItem(this.activeId)
  }

  setFocus (event) {
    this.focused = event.type === 'focus'
  }

  getRecordIds () {
    return this.records.map(record => record.Id)
  }

  sortAlpha (a, b) {
    const aName = a[this.title].toLowerCase()
    const bName = b[this.title].toLowerCase()

    if (aName < bName) return -1
    if (aName > bName) return 1

    return 0
  }

  fireToast (notification) {
    const toast = new ShowToastEvent(notification)
    this.dispatchEvent(toast)
  }
}
