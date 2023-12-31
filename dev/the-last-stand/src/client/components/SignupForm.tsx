//  Nom du fichier : SignupForm.tsx
//  Contexte : Un composant React qui permet de créer un formulaire d'inscription
//  Nom de l'auteur : Andrzej Wisniowski
//  Autres étudiants : Jonathan Robinson-Roberge
//  Référence : https://chat.openai.com/

import { Link } from 'react-router-dom';
import BigRoundedInput from './BigRoundedInput';
import UpcomingOverlay from './UpcomingOverlay';

const SignupForm = () => {
  return (
    <form className='flex flex-col gap-4 relative'>
      <UpcomingOverlay />
      <BigRoundedInput
        color='green-900'
        type='text'
        placeholder='Username'
      />
      <BigRoundedInput
        color='green-900'
        type='password'
        placeholder='Password'
      />
      <BigRoundedInput
        color='green-900'
        type='password'
        placeholder='Confirm Password'
      />
      <button className='bg-green-900 rounded-xl p-3 border-4 border-green-600 hover:bg-green-600 hover:border-green-900 transition ease-in-out duration-300 hover:scale-110'>
        <Link to='/home'>Signup</Link>
      </button>
    </form>
  );
};

export default SignupForm;
