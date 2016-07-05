export class CubicEasing {
    public easeOut(time, start, end, duration) {
        return end * ((time = time / duration - 1.0) * time * time + 1.0) + start;
    }

    public easeIn(time, start, end, duration) {
        return end * (time /= duration) * time * time + start;
    }

    public easeInOut(time, start, end, duration) {
        if ((time /= duration / 2.0) < 1.0) return end / 2.0 * time * time * time + start;
        return end / 2.0 * ((time -= 2.0) * time * time + 2.0) + start;
    }
}

