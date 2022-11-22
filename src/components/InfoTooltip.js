import React from 'react';
import SuccessIcon from '../images/success-icon.svg';
import ErrorIcon from '../images/error-icon.svg';

function InfoTooltip({ isOpen, onClose, status }) {
  return (
    <div className={`popup ${isOpen && 'popup_opened'}`}>
      <div className='popup__container'>
        <form className='form' noValidate>
          <button
            type='button'
            className='popup__close-btn'
            onClick={onClose}
          ></button>
          {status === 'success' ? (
            <div>{console.log('success')}
              <img className='popup__icon' src={SuccessIcon} alt='success' />
              <p className='popup__status-message'>
                Success! you have now been registered.
              </p>
            </div>
          ) : (
            <div>{console.log('err')}
              <img className='popup__icon' src={ErrorIcon} alt='error' />
              <p className='popup__status-message'>
                Oops, something went wrong! Please try again.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default InfoTooltip;
