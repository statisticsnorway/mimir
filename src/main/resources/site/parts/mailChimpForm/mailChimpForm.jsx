import React from "react";
import { Button, Input } from '@statisticsnorway/ssb-component-library'

function MailchimpForm(props){

  function submit(e){
    console.log(e)
  }

  return (
    <form method="post" action={props.endpoint}>
      <Input type="email" name="EMAIL"/>
      <input type="text" name={props.id} value="" hidden/>
      <Button onClick={submit}>Registrer deg</Button>
    </form>
  )
}


export default (props) => <MailchimpForm {...props}/>

