import { HOST_URL, HOST_PORT } from '../config';

const SocialLoginForm = () => {
  const handleGoogleAuthClick = () => {
    window.location.href = `${HOST_URL.toString()}:${HOST_PORT}/auth/google`;
  };
  const handleFacebookAuthClick = () => {
    window.location.href = `${HOST_URL.toString()}:${HOST_PORT}/auth/facebook`;
  };

  return (
    <>
      <button
        className=' bg-purple-900 rounded-xl p-3 border-4 border-fuchsia-700 hover:bg-fuchsia-700 hover:border-purple-900 transition ease-in-out duration-300 hover:scale-110'
        onClick={handleGoogleAuthClick}>
        Sign Up With Google
      </button>
      <button
        className=' bg-purple-900 rounded-xl p-3 border-4 border-fuchsia-700 hover:bg-fuchsia-700 hover:border-purple-900 transition ease-in-out duration-300 hover:scale-110'
        onClick={handleFacebookAuthClick}>
        Sign Up With Facebook
      </button>
    </>
  );
};

export default SocialLoginForm;
