/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { JSX } from 'react';

export default function Content(): JSX.Element {
  console.log("i'm in content")
  return (
    <div id='my-ext' className='container fixed z-1000 top-0 w-[100%]' data-theme='light'>
      HOLLA SOY DORA
    </div>
  );
}
