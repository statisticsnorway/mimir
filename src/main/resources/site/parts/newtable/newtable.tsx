import React from 'react'
import { Table, TableHead, TableBody, TableFooter, TableRow, TableCell } from '@statisticsnorway/ssb-component-library'

function NewTable() {
  return (
    <div style={{ padding: '4rem' }}>
      <Table caption='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras non pretium felis. Aenean eu ipsum in magna auctor porta. Donec vestibulum nulla vel laoreet blandit.'>
        <TableHead>
          <TableRow>
            <TableCell type='th' rowSpan={2} align='right'>
              2020
            </TableCell>
            <TableCell type='th' colSpan={2} scope='colgroup'>
              Second level
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell type='th' scope='col' align='right'>
              First level
            </TableCell>
            <TableCell type='th' scope='col' align='right'>
              First level<sup>1</sup>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell type='th' scope='row'>
              Total (with numbers)
            </TableCell>
            <TableCell align='right'>1 000</TableCell>
            <TableCell align='right'>2 000</TableCell>
          </TableRow>
          <TableRow>
            <TableCell type='th' scope='row' indentationLevel={1}>
              First level
            </TableCell>
            <TableCell align='right'>50</TableCell>
            <TableCell align='right'>100</TableCell>
          </TableRow>
          <TableRow>
            <TableCell type='th' scope='row' indentationLevel={2}>
              Second level
            </TableCell>
            <TableCell align='right'>200</TableCell>
            <TableCell align='right'>650</TableCell>
          </TableRow>
          <TableRow>
            <TableCell type='th' scope='row' indentationLevel={3}>
              Third level
            </TableCell>
            <TableCell align='right'>500</TableCell>
            <TableCell align='right'>200</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell type='td' colSpan={3}>
              <div>
                <sup>1</sup> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris lacinia massa ut velit
                pulvinar, a ullamcorper odio pulvinar. Nulla vulputate congue justo a bibendum. Maecenas aliquet
                volutpat urna ac bibendum. Morbi at pharetra massa. Sed ornare diam eleifend, semper ipsum sed, feugiat
                purus.
              </div>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell type='td' colSpan={3}>
              <sup>2</sup> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras non pretium felis.
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell type='td' colSpan={3}>
              <sup>3</sup> Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

export default NewTable
