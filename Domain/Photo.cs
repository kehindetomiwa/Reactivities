using System;
using System.Text.Json.Serialization;

namespace Domain;

public class Photo
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Url { get; set; } = string.Empty;
    public string publicId { get; set; } = string.Empty;

    //navigation props
    public string? UserId { get; set; }
    [JsonIgnore]
    public User User { get; set; } = null!;
}