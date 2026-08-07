using Application.Core;

public class PageList<T, TCursor>
{
    public List<T> Items { get; set; } = [];
    public TCursor? NextCursor { get; set; }
}