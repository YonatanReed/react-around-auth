import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect, useHistory } from 'react-router-dom';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';

import ProtectedRoute from './ProtectedRoute'; // p14
import Register from './Register'; // p14
import Login from './Login'; // p14
import * as auth from '../utils/auth';
import InfoTooltip from './InfoTooltip';

import EditProfilePopup from './EditProfilePopup';
import AddPlacePopup from './AddPlacePopup';
import EditAvatarPopup from './EditAvatarPopup';
import ImagePopup from './ImagePopup';
import api from '../utils/api';
import { CurrentUserContext } from '../contexts/CurrentUserContext';

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState({
    name: '',
    link: '',
  });

  const [tooltipStatus, setTooltipStatus] = useState(''); // p14
  const [isInfoToolTipOpen, setIsInfoToolTipOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(true); // p14
  const [email, setEmail] = useState('');
  const history = useHistory();

  useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([userInfo, cardsData]) => {
        setCurrentUser(userInfo);
        setCards(cardsData);
      })
      .catch(console.log);
  }, []);

  // p14 - check for jwt when mounting app
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      auth
        .checkToken(token)
        .then((res) => {
          if (res) {
            setEmail(res.data.email);
            setIsLoggedIn(true);
            history.push('/');
          } else {
            localStorage.removeItem('jwt');
          }
        })
        .catch((err) => console.log(err));
    }
  }, []);

  const handleCardLike = (card) => {
    const isLiked = card.likes.some((user) => user._id === currentUser._id);

    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((currentCard) =>
            currentCard._id === card._id ? newCard : currentCard
          )
        );
      })
      .catch(console.log);
  };

  const handleCardDelete = (card) => {
    api
      .deleteCard(card._id)
      .then(() => {
        setCards(cards.filter((item) => item !== card));
      })
      .catch(console.log);
  };

  const handleEditProfileClick = () => {
    setIsEditProfilePopupOpen(!isEditProfilePopupOpen);
  };

  const handleAddPlaceClick = () => {
    setIsAddPlacePopupOpen(!isAddPlacePopupOpen);
  };

  const handleEditAvatarClick = () => {
    setIsEditAvatarPopupOpen(!isEditAvatarPopupOpen);
  };

  const handleCardClick = (data) => {
    setIsImagePopupOpen(true);
    setSelectedCard({ name: data.name, link: data.link });
  };

  const handleUpdateUser = ({ name, about }) => {
    api
      .updateUserInfo(name, about)
      .then((user) => {
        setCurrentUser(user);
        closeAllPopups();
      })
      .catch(console.log);
  };

  const handleUpdateAvatar = ({ avatar }) => {
    api
      .updateAvatar(avatar)
      .then((user) => {
        setCurrentUser(user);
        closeAllPopups();
      })
      .catch(console.log);
  };

  const handleAddPlaceSubmit = ({ name, link }) => {
    api
      .uploadCard({ name: name, link: link })
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch(console.log);
  };

  const closeAllPopups = () => {
    setIsEditProfilePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsImagePopupOpen(false);
    setIsInfoToolTipOpen(false);
  };

  function onRegister({ email, password }) {
    auth
      .register(email, password)
      .then((res) => {
        if (res.data._id) {
          setTooltipStatus('success');
          setIsInfoToolTipOpen(true);
          history.push('/signin');
        } else {
          setTooltipStatus('fail');
          setIsInfoToolTipOpen(true);
        }
      })
      .catch(() => {
        setTooltipStatus('fail');
        setIsInfoToolTipOpen(true);
      });
  }

  function onLogin({ email, password }) {
    auth
      .login(email, password)
      .then((res) => {
        if (res.token) {
          setIsLoggedIn(true);
          setEmail(email);
          localStorage.setItem('jwt', res.token);
          history.push('/');
        } else {
          setTooltipStatus('fail');
          setIsInfoToolTipOpen(true);
        }
      })
      .catch((err) => {
        setTooltipStatus('fail');
        setIsInfoToolTipOpen(true);
      });
  }

  function onSignOut() {
    localStorage.removeItem('jwt');
    setIsLoggedIn(false);
    history.push('/signin');
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <Header email={email} onSignOut={onSignOut} />
      <Switch>
        <ProtectedRoute exact path='/' isLoggedIn={isLoggedIn}>
          <Main
            cards={cards}
            handleEditProfileClick={handleEditProfileClick}
            handleAddPlaceClick={handleAddPlaceClick}
            handleEditAvatarClick={handleEditAvatarClick}
            onCardClick={handleCardClick}
            onCardLike={handleCardLike}
            onCardDelete={handleCardDelete}
          />
        </ProtectedRoute>

        <Route path='/signup'>
          <Register onRegister={onRegister} />
        </Route>

        <Route path='/signin'>
          <Login onLogin={onLogin} />
        </Route>

        <Route path='/'>
          {isLoggedIn ? <Redirect to='/' /> : <Redirect to='/signin' />}
        </Route>
      </Switch>

      <Footer />
      <EditProfilePopup
        isOpen={isEditProfilePopupOpen}
        onClose={closeAllPopups}
        onUpdateUser={handleUpdateUser}
      />

      <AddPlacePopup
        isOpen={isAddPlacePopupOpen}
        onClose={closeAllPopups}
        onAddPlaceSubmit={handleAddPlaceSubmit}
      />

      <EditAvatarPopup
        isOpen={isEditAvatarPopupOpen}
        onClose={closeAllPopups}
        onUpdateAvatar={handleUpdateAvatar}
      />

      <ImagePopup
        selectedCard={selectedCard}
        isOpen={isImagePopupOpen}
        onClose={closeAllPopups}
      />

      <InfoTooltip
        isOpen={isInfoToolTipOpen}
        onClose={closeAllPopups}
        status={tooltipStatus}
      />
    </CurrentUserContext.Provider>
  );
}

export default App;
