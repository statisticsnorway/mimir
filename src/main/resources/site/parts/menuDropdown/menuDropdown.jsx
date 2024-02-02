import React, { useEffect, useRef, useState } from 'react'
import { Dropdown } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { ChevronDown, ChevronUp } from 'react-feather'

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
  const [mapOpen, setMapOpen] = useState(false)

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

  const onSelectMunicipality = (e, baseUrl) => {
    const url = baseUrl + e.id
    window.location.href = url
  }

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
          {municipality && (
            <div className='roboto-bold municipality'>{`${municipalityName} (${municipality.county.name.trim()})`}</div>
          )}
        </div>
      )
    } else {
      return (
        <div className='title-container d-flex align-items-center'>
          <div className='roboto-bold title-choose-municipality municipality'>Velg kommune i kart</div>
        </div>
      )
    }
  }

  const renderSearchContainer = () => {
    return (
      <div className='search-container d-flex align-items-center'>
        <div className='choose-municipality-search d-flex align-items-center'>
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
        {modeMunicipality && renderShowMapButton()}
      </div>
    )
  }

  const openMap = () => {
    setMapOpen(!mapOpen)
    if (!mapOpen) {
      console.log('\x1b[32m%s\x1b[0m', 'SCROLL')
      window.scroll({
        top: stickyMenuRef.current.offsetTop,
        behavior: 'smooth',
      })
    }
  }

  const renderMap = () => {
    return (
      <div>
        <div id='js-show-map' className={mapOpen ? 'container' : 'container collapse'}>
          <section className='xp-part part-map'>
            <div id='map' className='map-border' data-path={dataPathAssetUrl} data-service={dataServiceUrl}></div>
          </section>
        </div>
      </div>
    )
  }

  const renderShowMapButton = () => {
    return (
      <button className='show-map' onClick={() => openMap()}>
        <span className='d-none d-lg-inline-block'>Velg i kart</span>
        {mapOpen ? <ChevronUp size='24' /> : <ChevronDown size='24' />}
      </button>
    )
  }

  return (
    <div id='sticky-menu' className='sticky-menu w-100' ref={stickyMenuRef}>
      <section className={`part-menu-dropdown d-print-none ${fixedClass}`}>
        <div
          className={modeMunicipality ? `container position-relative municipality-mode` : `container position-relative`}
        >
          <div className='menu-content d-flex flex-row align-items-center justify-content-between'>
            {renderTitleContainer()}
            {renderSearchContainer()}
          </div>
        </div>
        {modeMunicipality && renderMap()}
      </section>
      {!modeMunicipality && renderMunicipalityLinks()}
    </div>
  )
}

MenuDropdown.propTypes = {
  modeMunicipality: PropTypes.bool,
  displayName: PropTypes.string,
  ariaLabel: PropTypes.string,
  placeholder: PropTypes.string,
  items: PropTypes.object,
  baseUrl: PropTypes.string,
  municipality: PropTypes.object,
  municipalityName: PropTypes.string,
  municipalityList: PropTypes.object,
  dropdownId: PropTypes.string,
  dataPathAssetUrl: PropTypes.string,
  dataServiceUrl: PropTypes.string,
}

export default (props) => <MenuDropdown {...props} />
