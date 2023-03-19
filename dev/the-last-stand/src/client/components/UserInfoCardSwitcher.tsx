import EditButton from './EditButton';
import ShowUserInfo from './ShowUserInfo';
import EditUserInfo from './EditUserInfo';
import { IUser } from '../../typescript/interfaces/IUser';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../fetches/users';

const UserInfoCard = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    async function fetchData() {
      const user = await getCurrentUser();
      setUser(user);
    }
    fetchData();
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
    !isEditing && console.log('save');
    !isEditing && setIsSubmitting(true);
  };

  return (
    user && (
      <div
        className='flex gap-4 w-full h-fit justify-evenly rounded-tl-3xl transition ease-in-out duration-300'
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
        <EditButton
          className={`absolute top-2 left-1 w-fit h-fit ${isHovered ? 'opacity-100' : 'opacity-0'} transition duration-1000`}
          onClick={handleEdit}
        />
        <ShowUserInfo
          className={`${!isEditing} ? 'z-10' : ''}`}
          user={user}
        />
        <EditUserInfo
          className={`${isEditing} ? 'z-10' : ''}`}
          user={user}
          isSubmitting={isSubmitting}
        />
      </div>
    )
  );
};

export default UserInfoCard;
