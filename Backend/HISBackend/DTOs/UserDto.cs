using HISBackend.Models;
namespace HISBackend.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? Phone { get; set; }
        public RoleType Role { get; set; }
        public SpecialtyType? Specialty { get; set; }

    }

}