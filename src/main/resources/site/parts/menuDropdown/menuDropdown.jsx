import React, { useEffect, useRef, useState } from 'react'
import { Dropdown, ButtonTertiary } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

function MenuDropdown(props) {
  const {
    baseUrl,
    dataPathAssetUrl,
    dataServiceUrl,
    displayName,
    modeMunicipality,
    municipality,
    municipalityName,
    municipalityList,
  } = props
  const stickyMenuRef = useRef(null)
  const [fixedClass, setFixedClass] = useState('')

  const stickyMenu = () => {
    const stickyMenu = stickyMenuRef.current
    if (stickyMenu) {
      const boundingRect = stickyMenu.getBoundingClientRect()
      const stickyTop = boundingRect.top
      if (stickyTop < 0) {
        stickyMenu.style.height = `${boundingRect.height}px`
        setFixedClass('fixed-top border-bottom shadow-sm')
      } else if (stickyTop > 0) {
        stickyMenu.style.height = null
        setFixedClass('')
      }
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', stickyMenu)
    return () => window.removeEventListener('scroll', stickyMenu)
  }, [])

  const renderMunicipalityLinks = () => {
    if (municipalityList) {
      return (
        <div className='municipality-link-list d-none'>
          <ul className='municipality-link-list'>
            {municipalityList.map((municipality, index) => {
              return (
                <li key={index}>
                  <a className='municipality-link' href={`${baseUrl}${municipality.id}`}>
                    {municipality.title}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      )
    }
  }

  const renderTitleContainer = () => {
    if (modeMunicipality) {
      return (
        <div className='title-container'>
          <div className='roboto-plain subtitle d-none d-md-block'>{displayName}</div>
          <div className='roboto-bold municipality'>
            {municipality && <div>{`${municipalityName} (${municipality.county.name})`}</div>}
          </div>
        </div>
      )
    } else {
      return (
        <div className='title-container'>
          <div className='roboto-bold title-choose-municipality municipality'>Velg kommune i kart</div>
        </div>
      )
    }
  }

  const renderSearchContainer = () => {
    return (
      <div id='search-container' className='collapse'>
        <div className={!modeMunicipality ? 'choose-municipality-search' : 'choose-municipality-search hide-search'}>
          {modeMunicipality && <div className='change-municipality roboto-bold text-nowrap'>Bytt kommune:</div>}
          <div className='component-dropdown w-100'>
            <Dropdown
              items={props.items}
              searchable
              placeholder={props.placeholder}
              ariaLabel={props.ariaLabel}
              onSelect={(e) => {
                onSelectMunicipality(e, props.baseUrl)
              }}
            />
          </div>
        </div>
        <div className='show-map'>{renderShowMapButton()}</div>
      </div>
    )
  }

  const renderShowMapButton = () => {
    return (
      <ButtonTertiary
        id='show-map'
        header='Velg i kart'
        className={`button-margin-top d-none d-lg-inline-block`}
      ></ButtonTertiary>
    )
  }

  const renderMap = () => {
    return (
      <div id='js-show-map' className='container collapse'>
        <section className='xp-part part-map'>
          <div id='map' className='map-border' data-path={dataPathAssetUrl} data-service={dataServiceUrl}></div>
        </section>
      </div>
    )
  }

  return (
    <div id='sticky-menu' className='w-100' ref={stickyMenuRef}>
      <section className={`xp-part part-menu-dropdown d-print-none ${fixedClass}`}>
        <div className='container position-relative'>
          <div className='sticky-content d-flex flex-row align-items-center justify-content-between'>
            {renderTitleContainer()}
            {renderSearchContainer()}
          </div>
        </div>
      </section>
      {!modeMunicipality && renderMunicipalityLinks()}
    </div>
  )
}

const onSelectMunicipality = (e, baseUrl) => {
  const url = baseUrl + e.id
  window.location.href = url
}

MenuDropdown.propTypes = {
  modeMunicipality: PropTypes.bool,
  displayName: PropTypes.string,
  ariaLabel: PropTypes.string,
  placeholder: PropTypes.string,
  items: PropTypes.object,
  baseUrl: PropTypes.string,
  dataPathAssetUrl: PropTypes.string,
  dataServiceUrl: PropTypes.string,
  municipality: PropTypes.object,
  municipalityName: PropTypes.string,
  municipalityList: PropTypes.object,
  dropdownId: PropTypes.string,
}

export default (props) => <MenuDropdown {...props} />
