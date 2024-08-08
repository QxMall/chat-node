const UserResult = (userRow = {}) => {
  return {
    userId: userRow.user_id || '',
    // id: userRow.id || '',
    username: userRow.username || '',
    name: userRow.name || '',
    userType: userRow.user_type || '',
    avatar: userRow.avatar || '',
    roleName: userRow.role_name || '',
    postId: userRow.post_id || '',
    deptId: userRow.dept_id || '',
    authority: userRow.authority || '',
    email: userRow.email || '',
    phoneNumber: userRow.phonenumber || '',
    lastLoginTime: userRow.login_date || '',
    createBy: userRow.create_by || '',
    remark: userRow.remark || '',
    creationDate: userRow.createdAt || '',
  };
};

module.exports = UserResult;
