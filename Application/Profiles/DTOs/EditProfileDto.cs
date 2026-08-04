using System;

namespace Application.Profiles.DTOs;

public class EditProfileDto
{
    public required string DisplayName { get; set; }

    // Registration never asks for a bio, so an existing profile may legitimately
    // have none - the validator leaves this one alone.
    public string? Bio { get; set; }
}
