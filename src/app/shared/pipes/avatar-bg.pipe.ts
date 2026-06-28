import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'avatarBg',
  standalone: true
})
export class AvatarBgPipe implements PipeTransform {
  private readonly gradients = [
    'linear-gradient(135deg, #1A345C, #7CA1C4)', // Deep Blue to Soft Blue
    'linear-gradient(135deg, #FF6B6B, #FF8E53)', // Warm Coral/Orange
    'linear-gradient(135deg, #4E65FF, #92EFFD)', // Bright Blue to Cyan
    'linear-gradient(135deg, #76b852, #8DC26F)', // Fresh Green
    'linear-gradient(135deg, #654ea3, #eaafc8)', // Purple to Pink
    'linear-gradient(135deg, #f12711, #f5af19)', // Sunset Orange to Yellow
    'linear-gradient(135deg, #00c6ff, #0072ff)', // Ocean Blue
    'linear-gradient(135deg, #11998e, #38ef7d)', // Emerald Green
    'linear-gradient(135deg, #8A2387, #E94E1B)', // Purple to Accent Orange
    'linear-gradient(135deg, #f857a6, #ff5858)', // Magenta/Red
    'linear-gradient(135deg, #3a7bd5, #3a6073)', // Slate Blue
    'linear-gradient(135deg, #f953c6, #b91d73)'  // Pink to Dark Pink
  ];

  transform(name: string | null | undefined): string {
    if (!name) {
      return this.gradients[0];
    }
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.gradients.length;
    return this.gradients[index];
  }
}
