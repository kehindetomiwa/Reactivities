namespace Domain;

public class UserFollowing
{
    public required string OberverId {get; set;}
    public User Oberser {get; set;} = null!;

    public required string TargetId {get; set;}
    public User Target {get; set;} = null!;
}