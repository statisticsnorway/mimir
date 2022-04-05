
const ssbGreen4 = '#00824d'
const ssbDark6 = '#162327'
const borderDark = `1px solid ${ssbDark6}`

export const customAsyncSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    boxShadow: 'none',
    border: 'none',
    borderRadius: 'none',
    outline: state.isFocused && `2px solid ${ssbGreen4}`,
    outlineOffset: state.isFocused && '-1px'
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: ssbGreen4
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    border: borderDark,
    borderLeft: 'transparent',
    borderRadius: '0px',
    color: ssbGreen4
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: 'transparent'
  }),
  menu: (provided) => ({
    ...provided,
    margin: '0px',
    border: borderDark,
    borderRadius: '0px'
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '0px'
  }),
  option: (provided, state) => ({
    backgroundColor: state.isSelected ? ssbGreen4 : (state.isFocused ? '#274247' : 'white'),
    fontWeight: state.isSelected && '700',
    color: state.isFocused || state.isSelected ? 'white' : ssbDark6,
    padding: '12px',
    opacity: 1
  }),
  placeholder: (provided) => ({
    ...provided,
    color: ssbDark6
  }),
  valueContainer: (provided) => ({
    ...provided,
    border: borderDark,
    borderRight: 'transparent',
    borderRadius: '0px',
    fontSize: '16px'
  })
}
