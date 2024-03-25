import React, { useEffect, useRef, useState } from 'react'
import { Dropdown } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, ChevronUp } from 'react-feather'
import { type MenuDropdownProps, type Municipality } from '../../../lib/types/partTypes/menuDropdown'

function MenuDropdown(props: MenuDropdownProps) {
  const {
    baseUrl,
    dataPathAssetUrl,
    dataServiceUrl,
    modeMunicipality,
    municipality,
    municipalityName,
    municipalityList,
  } = props
  const stickyMenuRef = useRef<HTMLDivElement>(null)
  const [fixedClass, setFixedClass] = useState('')
  const [mapOpen, setMapOpen] = useState(false)

  const stickyMenu = () => {
    const stickyMenu = stickyMenuRef.current
    if (stickyMenu && modeMunicipality) {
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

  const onSelectMunicipality = (mun: Municipality, baseUrl: string) => {
    const url = baseUrl + mun.id
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
    return (
      <div className='title-container d-flex align-items-center'>
        {modeMunicipality && municipality ? (
          <div className='roboto-bold municipality'>{`${municipalityName} (${municipality.county.name.trim()})`}</div>
        ) : (
          <div className='roboto-bold municipality'>Velg kommune i kart</div>
        )}
      </div>
    )
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
              onSelect={(item: Municipality) => {
                onSelectMunicipality(item, props.baseUrl)
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
    if (!mapOpen && stickyMenuRef.current) {
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
      <button className='show-map d-none d-lg-inline-block' onClick={() => openMap()}>
        <span>Velg i kart</span>
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

export default (props: MenuDropdownProps) => <MenuDropdown {...props} />
